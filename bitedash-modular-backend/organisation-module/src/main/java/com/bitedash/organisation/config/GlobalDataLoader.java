package com.bitedash.organisation.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.bitedash.organisation.entity.Organization;
import com.bitedash.organisation.repository.OrganizationRepository;

@Component
public class GlobalDataLoader implements CommandLineRunner {
	OrganizationRepository orgRepository;

	GlobalDataLoader(OrganizationRepository orgRepository){
		this.orgRepository=orgRepository;
	}

	@Override
    public void run(String... args) {
        if (orgRepository.findByName("BiteDash").isEmpty()) {
            Organization org = new Organization();
            org.setName("BiteDash");
            org.setDomain("bitedash.com");
            org.setCreatedBy("SYSTEM");
            org.setCreatedAt(LocalDateTime.now());
            orgRepository.save(org);
        }
    }
}
