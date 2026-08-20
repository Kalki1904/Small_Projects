import java.util.ArrayList;
import java.util.Scanner;

public class BankService {
      ArrayList<BankAccount> bank = new ArrayList<BankAccount>();
      Scanner sc = new Scanner(System.in);
      BankService(){
            bank.add(new BankAccount(1,1000,1));
            bank.add(new BankAccount(2,2000,2));
            bank.add(new BankAccount(3,3000,3));
            bank.add(new BankAccount(4,4000,4));
            bank.add(new BankAccount(5,5000,5));
      }
      synchronized void accountDetails(int id ){
            for(BankAccount b: bank){
                  if(b.getAccountNumber()==id){
                        System.out.println(b.getBalance());
                        return;
                  }
            }
            System.out.println("Invalid");
            
      }

      synchronized void credit(int account,int amt){
            for(BankAccount b: bank){
                  if(b.getAccountNumber()==account){
                        b.credit(amt);
                        System.out.println("Final Balance: "+b.getBalance());
                        return ;
                  }
                  
            }
            System.out.println("Invalid");
      }

      synchronized void debit(int account , int amt){
            for(BankAccount b: bank){
                  if(b.getAccountNumber()==account){
                        b.debit(amt);
                        System.out.println("Final Balance: "+b.getBalance());
                        return ;
                  }
                  
            }
            System.out.println("Invalid");
      }

      public synchronized void transfer(int account1, int account2,int amt){
            for(BankAccount b: bank){
                  if(b.getAccountNumber()==account1){
                        for(BankAccount b2:bank){
                              if(b2.getAccountNumber()==account2){
                                    b.debit(amt);
                                    b2.credit(amt);
                                    System.out.println("Final Balance AC"+b.getAccountNumber()+": "+b.getBalance()+" AC"+b2.getAccountNumber()+": "+ b2.getBalance());
                              }
                        }
                  }
                  
            }
      }
}
