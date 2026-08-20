public class BankAccount {
      private int AccountNumber;
      private int Balance;
      private int passWord;
      BankAccount(int AccountNumber,int Balance,int passWord){
            this.passWord=passWord;
            this.Balance=Balance;
            this.AccountNumber=AccountNumber;
      }


      public int getAccountNumber() {
            return AccountNumber;
      }
      public void setAccountNumber(int accountNumber) {
            AccountNumber = accountNumber;
      }
      public int getBalance() {
            return Balance;
      }
      public void credit(int balance) {
            Balance += balance;
      }
      public void debit(int balance ){
            Balance -=balance;
      }
      public int getPassWord() {
            return passWord;
      }
      public void setPassWord(int passWord) {
            this.passWord = passWord;
      }

}
