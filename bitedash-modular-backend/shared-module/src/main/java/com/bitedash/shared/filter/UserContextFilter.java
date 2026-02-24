package com.bitedash.shared.filter;

import com.bitedash.shared.util.UserContext;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class UserContextFilter implements Filter {
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;

		String userId = req.getHeader("X-Auth-User-Id");
		if (userId != null) {
			UserContext.set(new UserContext.UserContextHolder(
				req.getHeader(HttpHeaders.AUTHORIZATION),
				Long.valueOf(userId),
				req.getHeader("X-Auth-User-Username"),
				req.getHeader("X-Auth-User-Role"),
				parseLong(req.getHeader("X-Auth-User-Org-Id")),
				parseLong(req.getHeader("X-Auth-User-Office-Id"))
			));
		}
		try {
			chain.doFilter(request, response);
		} finally {
			UserContext.clear();
		}
	}

	private Long parseLong(String val) {
		return (val == null || "null".equals(val)) ? null : Long.valueOf(val);
	}
}
