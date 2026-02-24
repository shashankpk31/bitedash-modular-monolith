package com.bitedash.shared.config;

import com.bitedash.shared.util.UserContext;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        try {
            return Optional.of(UserContext.get().username());
        } catch (Exception e) {
            return Optional.of("system");
        }
    }
}
