package User;

import org.mindrot.jbcrypt.BCrypt;

public class user {
    private int id;
    private String name ;
    private String hashPassword;
    private int amount;
    private String type;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHashPassword() {
        return hashPassword;
    }

    public void setHashPassword(String hashPassword) {
        this.hashPassword=hashPassword;
    }

    public int getAmount() {
        return amount;
    }

    public String getType() {
        return type;
    }
    public void setAmount(int amount){
        this.amount=amount;
    }

    public void setType(String type) {
        this.type = type;
    }
}
