package DB;

import User.user;
import UserService.UserService;
//package org.example;

import DB.database;
import User.user;
import UserService.UserService;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Scanner;


import java.sql.*;
import java.util.Scanner;

public class database {
    private Connection con;

    public database(Connection con) throws SQLException {
        this.con=con;
    }


    //TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
    public class Main {
        public final void main(String[] args) throws SQLException {
            Scanner sc = new Scanner(System.in);
            database db = null;
            Connection con = Connections.getconnection();
            db = new database(con);
            UserService service = new UserService(con);
            int existing = 0 ;
            System.out.println("---WELCOME TO BANKING SYSTEM---");
            System.out.println("1: Login\n2:Create User");
            existing = sc.nextInt();
            sc.nextLine();
            if(existing==2) {
                service.create();
            }
            System.out.println("---LOGIN---");
            int id ;
            String password;
            System.out.print("Enter ID: ");
            id=sc.nextInt();
            sc.nextLine();
            System.out.print("Enter Password: ");
            password=sc.nextLine();
            user current = service.VerifyUser(id,password);
            if(current!=null){
                service.userInfo(current);
            }
            else{
                System.out.println("--WELCOME "+current.getName()+"--");
            }
        }
    }    public  void createUser(user n) throws SQLException {
        String query = "INSERT INTO users (name,password,type,amount) VALUES(?,?,?,?)";
        PreparedStatement ps = con.prepareStatement(
                query,
                Statement.RETURN_GENERATED_KEYS
        );
        ps.setString(1,n.getName());
        ps.setString(2,n.getHashPassword());
        ps.setString(3,n.getType());
        ps.setInt(4,n.getAmount());
        ps.executeUpdate();
        ResultSet rs = ps.getGeneratedKeys();
        rs.next();
        n.setId(rs.getInt("id"));
        ps.close();
    }

    public void updateInfo(int id , int password, String field, String newValue) throws SQLException {
        String query  = "update users set ? = ? where id = ?";
        PreparedStatement ps = con.prepareStatement(query);
        ps.setString(1,field);
        ps.setString(2,newValue);
        ps.setInt(3,id);
        ps.executeUpdate();
        ps.close();
    }
    public  void deleteUser(user current){
        String query = "delete from users where id=? ";
        try {
            PreparedStatement ps = con.prepareStatement(query);
            ps.setInt(1, current.getId());
            ps.executeUpdate();
            ps.close();
            System.out.println("Deleted");
        }catch(SQLException e){
            System.out.println("Failed");
        }
    }
    public  user searchUser(int id) throws SQLException {
        user temp = new user();
        String query =  "select * from users where id = ?";
        PreparedStatement ps =con.prepareStatement(query);
        ps.setInt(1,id);
        ResultSet rs = ps.executeQuery();
        while(rs.next()){
            temp.setId(rs.getInt("id"));
            temp.setType(rs.getString("type"));
            temp.setHashPassword(rs.getString("password"));
            temp.setName(rs.getString("name"));
            temp.setAmount(rs.getInt("amount"));
        }
        return temp;
    }
    public void updateAmount(user current , int amount) throws SQLException {
        String query = "update users set amount = ? where id = ?";
        PreparedStatement ps = con.prepareStatement(query);
        ps.setInt(1,amount);
        ps.setInt(2,current.getId());
        ps.executeUpdate();
        System.out.println("Balance: " + amount);
        ps.close();
    }
}
