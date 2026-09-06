package DB;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Connections {


    public static Connection getconnection() throws SQLException {
        String url = "jdbc:postgresql://localhost:5432/Bank";
        String uname = "postgres";
        String password = "0000";
        Connection con = DriverManager.getConnection(url,uname,password);
        return con;
    }
}
