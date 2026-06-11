package com.tienda.backend;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptTest {
    @Test
    public void testHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String raw = "admin123";
        String encoded = encoder.encode(raw);
        try {
            java.nio.file.Files.writeString(java.nio.file.Paths.get("hash.txt"), encoded);
        } catch (Exception e) {}
    }
}
