package org.example;

import DB.database;
import User.user;
import UserService.UserService;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Scanner;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) throws SQLException {
        Scanner sc = new Scanner(System.in);
        Connection con = database.getconnection();
        database db = new database(con);
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
        if(current==null){
            System.out.println("User Not found");
        }
        else{
            System.out.println("--WELCOME "+current.getName()+"--");
            int choice =0;
            while(choice!=5){
                System.out.println("1-Info\n2-Credit\n3-Debit\n4-Delete\n5-exit");
                choice=sc.nextInt();
                sc.nextLine();
                switch (choice){
                    case 1:
                        service.userInfo(current);
                        break;
                    case 2:
                        int credamount =0;
                        System.out.println("Enter the amount: ");
                        credamount=sc.nextInt();
                        sc.nextLine();
                        Thread t = service.credit(current,credamount);
                        t.start();
                        try{t.join();}catch(InterruptedException e){
                            System.out.println("Error Occured");
                        }
                        break;
                    case 3:
                        int debamount =0;
                        System.out.println("Enter the amount: ");
                        debamount=sc.nextInt();
                        sc.nextLine();
                        Thread deb = service.debit(current,debamount);
                        deb.start();
                        try{deb.join();}catch(InterruptedException e){
                            System.out.println("Error Occured");
                        }
                        break;
                    case 4:
                        service.deleteUser(current);
                        break;
                    default:
                        System.out.println("Not Valid");
                }
            }
        }
    }
}