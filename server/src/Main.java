import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class Main {
  private static final int MAX_BODY_LENGTH = 4096;

  private static List<Result> results = new ArrayList<>();
  private static Validator validator = new Validator();
  private static Checker checker = new Checker();

  public static void main(String[] args) {
    FCGIInterface fcgi = new FCGIInterface();
    while (fcgi.FCGIaccept() >= 0) {
      long startTime = System.nanoTime();
      try {
        handleRequest(startTime);
      } catch (IllegalArgumentException e) {
        String message = e.getMessage();
        if (message == null) {
          message = "Некорректный запрос";
        }
        sendError(400, "Bad Request", message, "");
      } catch (Exception e) {
        e.printStackTrace();
        sendError(500, "Internal Server Error", "Внутренняя ошибка сервера", "");
      }
    }
  }

  private static void handleRequest(long startTime) throws IOException {
    Properties env = FCGIInterface.request.params;
    String method = env.getProperty("REQUEST_METHOD", "");

    if (method.equals("GET")) {
      sendResults();
    } else if (method.equals("POST")) {
      handlePost(env, startTime);
    } else if (method.equals("DELETE")) {
      results.clear();
      sendResults();
    } else {
      sendError(405, "Method Not Allowed", "Метод " + method + " не поддерживается",
          "Allow: GET, POST, DELETE\r\n");
    }
  }

  private static void handlePost(Properties env, long startTime) throws IOException {
    String contentType = env.getProperty("CONTENT_TYPE", "");
    if (!contentType.startsWith("application/x-www-form-urlencoded")) {
      throw new IllegalArgumentException("Ожидается Content-Type: application/x-www-form-urlencoded");
    }

    Map<String, String> params = parseForm(readBody());

    double x = 0;
    double y = 0;
    double r = 0;
    String errorX = null;
    String errorY = null;
    String errorR = null;
    try {
      x = validator.validateX(params.get("x"));
    } catch (IllegalArgumentException e) {
      errorX = e.getMessage();
    }
    try {
      y = validator.validateY(params.get("y"));
    } catch (IllegalArgumentException e) {
      errorY = e.getMessage();
    }
    try {
      r = validator.validateR(params.get("r"));
    } catch (IllegalArgumentException e) {
      errorR = e.getMessage();
    }
    if (errorX != null || errorY != null || errorR != null) {
      sendFieldErrors(errorX, errorY, errorR);
      return;
    }

    boolean hit = checker.isHit(x, y, r);

    long execTimeNs = System.nanoTime() - startTime;
    Result result = new Result(results.size() + 1, x, y, r, hit, Instant.now(), execTimeNs);
    results.add(0, result);
    sendResults();
  }

  private static String readBody() throws IOException {
    FCGIInterface.request.inStream.fill();

    int contentLength = FCGIInterface.request.inStream.available();
    if (contentLength > MAX_BODY_LENGTH) {
      throw new IllegalArgumentException("Слишком большое тело запроса");
    }
    byte[] buffer = new byte[contentLength];
    int readBytes = FCGIInterface.request.inStream.read(buffer, 0, contentLength);

    return new String(buffer, 0, readBytes, StandardCharsets.UTF_8);
  }

  private static Map<String, String> parseForm(String body) {
    Map<String, String> params = new HashMap<>();
    for (String pair : body.split("&")) {
      int eq = pair.indexOf('=');
      if (eq < 0) {
        continue;
      }
      String key = decode(pair.substring(0, eq));
      String value = decode(pair.substring(eq + 1));
      if (params.containsKey(key)) {
        throw new IllegalArgumentException("Параметр " + key + " передан несколько раз");
      }
      params.put(key, value);
    }
    return params;
  }

  private static String decode(String s) {
    try {
      return URLDecoder.decode(s, StandardCharsets.UTF_8);
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Некорректно закодированные параметры запроса");
    }
  }

  private static void sendResults() {
    StringBuilder json = new StringBuilder("{\"results\":[");
    for (int i = 0; i < results.size(); i++) {
      if (i > 0) {
        json.append(',');
      }
      json.append(results.get(i).toJson());
    }
    json.append("]}");
    send(200, "OK", json.toString(), "");
  }

  private static void sendError(int status, String reason, String message, String extraHeaders) {
    send(status, reason, "{\"error\":" + toJsonString(message) + "}", extraHeaders);
  }

  private static void sendFieldErrors(String errorX, String errorY, String errorR) {
    String json = "{\"errorX\":" + toJsonString(errorX)
        + ",\"errorY\":" + toJsonString(errorY)
        + ",\"errorR\":" + toJsonString(errorR) + "}";
    send(400, "Bad Request", json, "");
  }

  private static String toJsonString(String s) {
    if (s == null) {
      return "null";
    }
    return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }

  private static void send(int status, String reason, String json, String extraHeaders) {
    byte[] body = json.getBytes(StandardCharsets.UTF_8);
    String headers = "Status: " + status + " " + reason + "\r\n"
        + "Content-Type: application/json; charset=utf-8\r\n"
        + "Content-Length: " + body.length + "\r\n"
        + "Cache-Control: no-store\r\n"
        + extraHeaders
        + "\r\n";
    byte[] head = headers.getBytes(StandardCharsets.US_ASCII);
    System.out.write(head, 0, head.length);
    System.out.write(body, 0, body.length);
    System.out.flush();
  }
}
