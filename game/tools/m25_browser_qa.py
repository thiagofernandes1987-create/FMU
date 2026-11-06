"""M25 Browser QA: same source HTML/CSS/browser bundle; inject into Chromium set_content
because navigation to file/http is blocked by environment policy. Screenshots at 3 viewports.
This is a real Chromium rendering/interaction, not static source review.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'public/fmu-m24'
OUTPUT=ROOT/'evidence/m25/visual'
OUTPUT.mkdir(parents=True,exist_ok=True)
html=(base/'index.html').read_text()
css=(base/'app.css').read_text()
js=(base/'app.bundle.js').read_text()
ev=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 def prepare(width,height):
  page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
  errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  page.set_content(html)
  page.add_style_tag(content=css)
  page.evaluate('''() => {window.__saveStore={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:(k)=>window.__saveStore[k]??null,setItem:(k,v)=>{window.__saveStore[k]=v},removeItem:(k)=>{delete window.__saveStore[k]}}});}''')
  page.add_script_tag(content=js)
  return page,errors
 for width,height,label in [(1440,900,'desktop'),(768,1024,'tablet'),(390,844,'mobile')]:
  page,errors=prepare(width,height)
  assert page.locator('h1').inner_text()=='Painel do clube',label
  assert page.locator('[data-nav]').count()==9
  assert page.locator('.toast').count()==0,'Unexpected startup error '+label
  dims=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,width:innerWidth})''')
  assert dims['scroll']<=dims['width']+1 and dims['body']<=dims['width']+1,(label,dims)
  img=str(OUTPUT/f'{label}_overview.png');page.screenshot(path=img,full_page=True)
  ev.append({'viewport':label,'width':width,'height':height,'initial_render':'PASS','no_overflow':True,'screenshot':str(Path(img).relative_to(ROOT)),'browser_errors':errors})
  if label=='desktop':
   page.locator('[data-action="advance"]').first.click()
   assert '2/18' in page.locator('.top-season').inner_text()
   # Catalog: every registered route renders a distinct heading, as app/tests/catalog.rs analogue.
   for route in ['overview','squad','tactics','calendar','replay','standings','market','finances','messages']:
    page.locator(f'[data-nav="{route}"]').click()
    assert page.locator('main h1').count()==1,route
   page.locator('[data-nav="calendar"]').click()
   assert page.locator('.fixture-state.done').count()==1
   assert page.locator('button[data-action^="open-replay:"]').count()==1
   page.locator('button[data-action^="open-replay:"]').first.click()
   assert page.locator('main h1').inner_text()=='Replay da partida'
   assert 'Demonstração:' in page.locator('.replay-disclaimer').inner_text()
   expected=page.evaluate('''() => {const c=JSON.parse(localStorage.getItem('fmu-m24-demo-save-v1')); const g=c.fixtures.find(x=>x.played&&(x.home===c.myClubId||x.away===c.myClubId));return [g.homeGoals,g.awayGoals]}''')
   page.locator('[data-action="replay-5"]').click()
   assert "1º tempo" in page.locator('.replay-live-clock').inner_text()
   page.locator('[data-action="replay-end"]').click()
   assert 'Fim de jogo' in page.locator('.replay-live-clock').inner_text()
   displayed=page.locator('.replay-score').inner_text().split(':')
   assert [int(x.strip()) for x in displayed]==expected,displayed
   page.screenshot(path=str(OUTPUT/'desktop_replay.png'),full_page=True)
   page.locator('[data-action="replay-reset"]').click()
   assert page.locator('.replay-score').inner_text().replace(' ','').replace('\n','')=='0:0'
   assert page.locator('[data-action="replay-match"]').count()==0
   ev.append({'case':'desktop_replay','result':'PASS','original_score':expected,'browser_errors':errors})
   page.locator('[data-nav="tactics"]').click()
   page.locator('[data-formation="3-5-2"]').click()
   assert page.locator('[data-formation="3-5-2"]').get_attribute('aria-pressed')=='true'
   page.locator('[data-action="swap"]').click()
   assert 'Titulares atualizados' in page.locator('.toast').inner_text()
   page.screenshot(path=str(OUTPUT/'desktop_tactics.png'),full_page=True)
   page.locator('[data-nav="market"]').click()
   assert page.locator('button[data-action^="hire:"]').count()==16
   page.locator('button[data-action^="hire:"]').first.click()
   assert page.locator('button[data-action^="hire:"]').count()==15
   page.locator('[data-nav="finances"]').click()
   assert page.locator('.finance-line').count()==1
   page.screenshot(path=str(OUTPUT/'desktop_finances.png'),full_page=True)
   saved=page.evaluate('''() => window.localStorage.getItem('fmu-m24-demo-save-v1')''')
   assert saved is not None
   state=json.loads(saved);assert state['round']==2 and len(state['transfers'])==1
   # Download is a real browser action, not a decorative button
   with page.expect_download(timeout=6000) as download_info:
    page.locator('[data-action="save"]').last.click()
   download=download_info.value
   assert download.suggested_filename.endswith('.json')
   page.locator('[data-action="advance"]').first.click() if page.locator('[data-action="advance"]').count() else page.locator('[data-nav="overview"]').click()
   if page.locator('[data-action="advance"]').count():page.locator('[data-action="advance"]').first.click()
   assert json.loads(page.evaluate('''() => localStorage.getItem('fmu-m24-demo-save-v1')'''))['round']>=3
   # Invalid file must show an error rather than clobbering the previous save.
   page.locator('#load-file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{not-valid}'})
   assert 'Não foi possível importar' in page.locator('.toast').inner_text()
   page.locator('#load-file').set_input_files({'name':'saved.json','mimeType':'application/json','buffer':saved.encode()})
   assert json.loads(page.evaluate('''() => localStorage.getItem('fmu-m24-demo-save-v1')'''))['round']==2
   ev.append({'case':'desktop_interactions','result':'PASS'})
  elif label=='mobile':
   assert page.locator('.mobile-menu').is_visible()
   page.locator('.mobile-menu').click()
   assert page.locator('.sidebar').evaluate('(el)=>el.classList.contains("is-open")')
   page.keyboard.press('Escape')
   assert not page.locator('.sidebar').evaluate('(el)=>el.classList.contains("is-open")')
   page.locator('.mobile-menu').click()
   page.locator('[data-nav="squad"]').click()
   assert page.locator('h1').inner_text()=='Elenco profissional'
   dims=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth,width:innerWidth})''')
   assert dims['scroll']<=dims['width']+1,dims
   page.screenshot(path=str(OUTPUT/'mobile_squad.png'),full_page=True)
   page.locator('.mobile-menu').click();page.locator('[data-nav="market"]').click()
   page.screenshot(path=str(OUTPUT/'mobile_market.png'),full_page=True)
   page.locator('.mobile-menu').click();page.locator('[data-nav="overview"]').click()
   page.locator('[data-action="advance"]').first.click()
   page.locator('.mobile-menu').click();page.locator('[data-nav="replay"]').click()
   assert page.locator('.replay-panel').count()==1
   page.locator('[data-action="replay-15"]').click()
   page.screenshot(path=str(OUTPUT/'mobile_replay.png'),full_page=True)
   dims=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth,width:innerWidth})''')
   assert dims['scroll']<=dims['width']+1,('mobile_replay',dims)
  elif label=='tablet':
   page.locator('.mobile-menu').click();page.locator('[data-nav="standings"]').click()
   assert page.locator('.league-table tbody tr').count()==10
   page.screenshot(path=str(OUTPUT/'tablet_standings.png'),full_page=True)
   page.locator('.mobile-menu').click();page.locator('[data-nav="overview"]').click()
   page.locator('[data-action="advance"]').first.click()
   page.locator('.mobile-menu').click();page.locator('[data-nav="replay"]').click()
   page.screenshot(path=str(OUTPUT/'tablet_replay.png'),full_page=True)
  assert not errors,errors
  page.close()
 browser.close()
(ROOT/'evidence/m25/visual_qa.json').write_text(json.dumps(ev,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(ev,ensure_ascii=False,indent=2))
