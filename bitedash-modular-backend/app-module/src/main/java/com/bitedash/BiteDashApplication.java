package com.bitedash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(
        scanBasePackages = {
                "com.bitedash.config",     
                "com.bitedash.shared",
                "com.bitedash.identity",
                "com.bitedash.organisation",
                "com.bitedash.order",
                "com.bitedash.menu",
                "com.bitedash.wallet",
                "com.bitedash.payment",
                "com.bitedash.notification",
                "com.bitedash.inventory"
        },
        exclude = {RedisRepositoriesAutoConfiguration.class}
)
@EnableJpaAuditing
@EnableAsync // Enable async processing for notifications
@EnableRetry // Enable retry mechanism for notifications
@EnableJpaRepositories(
        basePackages = {
                "com.bitedash.identity.repository",
                "com.bitedash.organisation.repository",
                "com.bitedash.order.repository",
                "com.bitedash.menu.repository",
                "com.bitedash.wallet.repository",
                "com.bitedash.payment.repository",
                "com.bitedash.notification.repository",
                "com.bitedash.inventory.repository"
        },
        considerNestedRepositories = true
)
@EntityScan(basePackages = {
        "com.bitedash.identity.entity",
        "com.bitedash.organisation.entity",
        "com.bitedash.order.entity",
        "com.bitedash.menu.entity",
        "com.bitedash.wallet.entity",
        "com.bitedash.payment.entity",
        "com.bitedash.notification.entity",
        "com.bitedash.inventory.entity"
})
public class BiteDashApplication {

    public static void main(String[] args) {
        SpringApplication.run(BiteDashApplication.class, args);
    }
}
