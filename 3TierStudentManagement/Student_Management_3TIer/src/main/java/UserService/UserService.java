package UserService;

import DB.database;
import User.user;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Scanner;

public class UserService {
     Scanner sc = new Scanner(System.in);
    private  Connection con;
    private database db;
    public UserService(Connection con) throws SQLException {
        this.con = con;

        this.db = new database(con);
    }

    public  void create() throws SQLException {
        user temp =new user();
        System.out.print("Enter your Name: ");
        temp.setName(sc.nextLine());
        String password;
        System.out.print("Enter your password: ");
        password=sc.nextLine();
        String hash = BCrypt.hashpw(password,BCrypt.gensalt(12));
        temp.setHashPassword(hash);
        System.out.print("Enter the type: ");
        int choice=0;
        System.out.print("1: Admin\n2: General: ");
        choice=sc.nextInt();
        sc.nextLine();
        if(choice==1)temp.setType("ADMIN");
        else if(choice==2)temp.setType("GENERAL");
        else System.out.println("NOT VALID");
        con.setAutoCommit(false);
        db.createUser(temp);
        con.commit();
        System.out.println("---USER INFO---");
        System.out.println("ID: "+ temp.getId());
        System.out.println("Name: "+ temp.getName());
        System.out.println("Type: "+temp.getType());
        System.out.println("-----------------------");
        System.out.println("Added Succesfullu");

    }

    public user VerifyUser(int id , String password) throws SQLException {
        try {
            user current = db.searchUser(id);
//            System.out.print("Enter the password: ");
//            password=sc.nextLine();
            if(BCrypt.checkpw(password,current.getHashPassword())){
                System.out.println("User Found");
                return current;
            }
            else{
                System.out.println("Password Incorrect");
            }

        }catch(SQLException e){
            System.out.println("Error Occured");
        }catch (NullPointerException e){
            System.out.println("User not found");
        }
        return null;
    }

    public void deleteUser(user current) throws SQLException {
        db.deleteUser(current);
    }
    public void userInfo(user curr) throws SQLException {
        user current = db.searchUser(curr.getId());
        System.out.println("---USER INFO---");
        System.out.println("ID: "+ current.getId());
        System.out.println("Name: "+ current.getName());
        System.out.println("Type: "+current.getType());
        System.out.println("Amount: "+current.getAmount());
        System.out.println("-----------------------");
    }

    public Thread debit(user curr,int amount){
        Thread t = new Thread(()-> {
            //Iam locking curr user for the time being to handle atomicity;
            synchronized (curr){
            int balance = curr.getAmount();
            if (balance < amount) {
                System.out.println("Insufficient Balance");
            } else {
                balance -= amount;
                try {
                    db.updateAmount(curr, balance);
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            }}
        });
        return t;
    }
//We cannot use scanner as both threads might acsses the scanner at the same time
    public synchronized Thread credit(user curr,int amount){
        Thread t =new Thread (()->{
            synchronized (curr) {
                int balance = curr.getAmount();
                balance += amount;
                try {
                    db.updateAmount(curr, balance);
                } catch (SQLException e) {
                    throw new RuntimeException(e);
                }
            }
        });
       return t;
    }

}
