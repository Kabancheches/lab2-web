import java.time.Instant;

public class Result {
  private int num;
  private double x;
  private double y;
  private double r;
  private boolean hit;
  private Instant time;
  private long execTimeNs;

  public Result(int num, double x, double y, double r, boolean hit, Instant time, long execTimeNs) {
    this.num = num;
    this.x = x;
    this.y = y;
    this.r = r;
    this.hit = hit;
    this.time = time;
    this.execTimeNs = execTimeNs;
  }

  public String toJson() {
    return "{"
        + "\"num\":" + num + ","
        + "\"x\":" + x + ","
        + "\"y\":" + y + ","
        + "\"r\":" + r + ","
        + "\"hit\":" + hit + ","
        + "\"time\":\"" + time + "\","
        + "\"execTimeNs\":" + execTimeNs
        + "}";
  }
}
