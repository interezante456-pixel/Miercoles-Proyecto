import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBCrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "admin123";
        String encoded = encoder.encode(raw);
        System.out.println("New Hash: " + encoded);
        System.out.println("Matches my hardcoded one? " + encoder.matches(raw, "$2a$10$Y1rVnL.b4u4G6E0O/wz0g.jR25RIdR1n0zE1NqR4/n7q0Y4Y5.n.W"));
    }
}
