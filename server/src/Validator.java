public class Validator {
  private static final double[] CORRECT_X = {-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2};
  private static final double[] CORRECT_R = {1, 2, 3, 4, 5};
  private static final double Y_MIN = -3;
  private static final double Y_MAX = 3;
  private static final int MAX_NUMBER_LENGTH = 19;

  public double validateX(String raw) {
    double x = parseNumber(raw, "X");
    if (!contains(CORRECT_X, x)) {
      throw new IllegalArgumentException("X должен быть одним из: -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2");
    }
    return x;
  }

  public double validateY(String raw) {
    double y = parseNumber(raw, "Y");
    if (y <= Y_MIN || y >= Y_MAX) {
      throw new IllegalArgumentException("Y должен быть в интервале (-3; 3)");
    }
    return y;
  }

  public double validateR(String raw) {
    double r = parseNumber(raw, "R");
    if (!contains(CORRECT_R, r)) {
      throw new IllegalArgumentException("R должен быть одним из: 1, 2, 3, 4, 5");
    }
    return r;
  }

  private double parseNumber(String raw, String name) {
    if (raw == null) {
      throw new IllegalArgumentException("Не передан параметр " + name);
    }
    String value = raw.trim().replace(',', '.');
    if (value.length() > MAX_NUMBER_LENGTH) {
      throw new IllegalArgumentException(name + " слишком длинный (не больше " + MAX_NUMBER_LENGTH + " символов)");
    }
    if (!value.matches("-?\\d+(\\.\\d+)?")) {
      throw new IllegalArgumentException(name + " должен быть числом");
    }
    return Double.parseDouble(value);
  }

  private boolean contains(double[] correctValues, double value) {
    for (double correct : correctValues) {
      if (correct == value) {
        return true;
      }
    }
    return false;
  }
}
