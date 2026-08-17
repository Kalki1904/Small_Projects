import java.util.Scanner;

public class Main{
      public static void main(String[] args) {
            System.out.println("WelCome");
            userService service = new userService();
            int choice =0;
            Scanner sc = new Scanner(System.in);
            while(choice !=3){
                  System.out.print("1-Create User \n2-Access User\n3-Exit\nEnter: ");
                  choice = sc.nextInt();
                  sc.nextLine();
                  switch(choice){
                        case 1:
                              System.out.print("Enter the Admin id: ");
                              int id = sc.nextInt();
                              sc.nextLine();
                              service.CreateUser(id);
                              break;

                        case 2:
                              System.out.print("Enter the Id: ");
                              int Uid = sc.nextInt();
                              sc.nextLine();
                              user p1 = service.AccessUser(Uid);
                              if(p1==null){
                                    System.out.println("Not Present");
                                    break;
                              }
                              System.out.println("ID: "+p1.getId());
                              System.out.println("Name: "+p1.getName());
                              System.out.println("Role: "+p1.getRole());
                              break;
                        case 3:
                              System.out.println("Thank You !!!");
                              break;
                        default:
                              System.err.println("Invalid");
                              break;
                  }
            }
            sc.close();
            
      }
}