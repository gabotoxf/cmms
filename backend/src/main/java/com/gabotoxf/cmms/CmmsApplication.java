package com.gabotoxf.cmms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CmmsApplication {


	public static void main(String[] args) {
		SpringApplication.run(CmmsApplication.class, args);
	}

}
