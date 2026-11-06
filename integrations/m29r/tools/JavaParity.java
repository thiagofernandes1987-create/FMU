/** Test-only independent JDK reference for FMU JavaRandom port. */
import java.util.*;
public class JavaParity {
  public static void main(String[] args) {
    long seed=Long.parseLong(args[0]);
    Random rng=new Random(seed);
    int[] bounds={2,3,7,16,31,100,1000,700000000,2147483647};
    for (int i=0;i<256;i++) {
      int b=bounds[i%bounds.length];
      System.out.println("B:"+b+":"+rng.nextInt(b));
      System.out.println("L:"+rng.nextLong());
      System.out.println("F:"+Float.floatToRawIntBits(rng.nextFloat()));
      System.out.println("D:"+Double.doubleToRawLongBits(rng.nextDouble()));
      System.out.println("I:"+rng.nextInt());
    }
    int[] a={0,1,2,3,4,5,6,7,8,9};
    for(int i=a.length-1;i>0;i--){int k=rng.nextInt(i+1);int t=a[i];a[i]=a[k];a[k]=t;}
    System.out.println("S:"+Arrays.toString(a));
  }
}
