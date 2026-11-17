public class Checker {
  public boolean isHit(double x, double y, double r) {
    return Circle(x, y, r) || Rectangle(x, y, r) || Triangle(x, y, r);
  }

  boolean Circle(double x, double y, double r) {
    return x >= 0 && y >= 0 && x * x + y * y <= r * r;
  }

  boolean Rectangle(double x, double y, double r) {
    return x <= 0 && y >= 0 && x >= -r / 2 && y <= r;
  }
  boolean Triangle(double x, double y, double r) {
    return x <= 0 && y <= 0 && y >= -2 * x - r;
  }
}
