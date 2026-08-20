class Transaction{
      public static void main(String[] args) {
            BankService bs = new BankService();
            Runnable obj1 = ()->{
                  bs.accountDetails(1);
                  bs.transfer(1,2,100);
                  bs.accountDetails(1);
            };
            Runnable obj2 = ()->{
                  bs.accountDetails(2);
                  bs.transfer(2,1,100);
                  bs.accountDetails(2);
            };
            // Runnable obj3 = ()->{
            //       bs.accountDetails(1);
            //       bs.credit(1,100);
            // };
            // Runnable obj4 = ()->{
            //       bs.accountDetails(1);
            //       bs.transfer(1, 2, 100);
            // };

            Thread t1 = new Thread(obj1);
            Thread t2 = new Thread(obj2);
            // Thread t3 = new Thread(obj3);
            // Thread t4 = new Thread(obj4);

            t1.start();
            t2.start();
            // t3.start();
            // t4.start();

            try{
                  t1.join();
                  t2.join();
                  // t3.join();
                  // t4.join();
            }catch(InterruptedException e){
                  System.out.println(e);
            }
      }
}