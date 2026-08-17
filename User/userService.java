import java.util.Scanner;

public class userService {
      user[] users = new user[10];
      private int id=1;

      Scanner sc = new Scanner(System.in);
      public userService(){
            users[0]=new user(0,"Mudit","Admin","123");
      }
      
      public int getId(){
            return id;
      }

      private boolean Authorization(int id){
            user existingUser= AccessUser(id);
            if(existingUser==null)return false;
            if(existingUser.getRole().equals("Admin")){

                  return true;
            }

            return false;
      }
      

      public user AccessUser(int id){
            
            for(user u: users){
                  if(u!=null && u.getId()==id){
                        System.out.print("Enter Password: ");
                        if(u.getPassword().equals(sc.nextLine()))return u;
                  }
            }
            System.out.println("User Not Found");
            return null;
      }

      public void CreateUser(int existingid){
            if(Authorization(existingid)){
                  System.out.println("Access Granted");
                  System.out.print("Enter the Name: ");
                  String uname=sc.nextLine();
                  System.out.print("Enter Role:");
                  String uRole=sc.nextLine();
                  System.out.print("Enter Password:");
                  String upassword=sc.nextLine();
                  System.out.println("New User Created with Id: "+ id);
                  users[id] = new user(id,uname,uRole,upassword);
                  id++;
      
            }
            else{
                  System.out.println("Unauthorized Access");
            }
            
      }
}
