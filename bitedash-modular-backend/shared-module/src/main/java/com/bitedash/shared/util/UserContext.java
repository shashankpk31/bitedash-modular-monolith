package com.bitedash.shared.util;

public class UserContext {
	private static final ThreadLocal<UserContextHolder> holder = new ThreadLocal<>();

	public record UserContextHolder(String authHeader, Long userId, String username, String role, Long orgId, Long officeId) {
	}

	public static void set(UserContextHolder context) {
		holder.set(context);
	}

	public static UserContextHolder get() {
		return holder.get();
	}

	public static void clear() {
		holder.remove();
	}
}
