package com.bitedash.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Configuration for serving static frontend files from the /static folder.
 * This enables the backend to serve the React frontend build output.
 *
 * Frontend build output should be placed in: src/main/resources/static/
 *
 * All API routes (/**​) are handled by controllers
 * All other routes are served from static files (SPA routing)
 *
 * NOTE: This is disabled in development. Enable for production deployment only.
 * In development, frontend runs separately on port 5173.
 */
@Configuration
@Profile({"prod", "aws"})
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static assets (JS, CSS, images, etc.)
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(31536000); // Cache for 1 year (immutable assets)

        // Serve all other requests through index.html for SPA routing
        // IMPORTANT: This must NOT match API routes (auth, payment, wallet, etc.)
        // API routes are handled by @RestController classes
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // Skip API routes - let controllers handle them
                        if (resourcePath.startsWith("auth/") ||
                            resourcePath.startsWith("payment/") ||
                            resourcePath.startsWith("wallet/") ||
                            resourcePath.startsWith("orders/") ||
                            resourcePath.startsWith("menus/") ||
                            resourcePath.startsWith("inventory/") ||
                            resourcePath.startsWith("organization/") ||
                            resourcePath.startsWith("organisation/") ||
                            resourcePath.startsWith("revenue/") ||
                            resourcePath.startsWith("user/") ||
                            resourcePath.startsWith("ws/") ||
                            resourcePath.startsWith("actuator/") ||
                            resourcePath.startsWith("swagger-ui/") ||
                            resourcePath.startsWith("v3/")) {
                            return null; // Let Spring MVC handle API routes
                        }

                        Resource requestedResource = location.createRelative(resourcePath);

                        // If the resource exists (file/asset), return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // Otherwise, return index.html for SPA routing
                        // This allows React Router to handle the route
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
