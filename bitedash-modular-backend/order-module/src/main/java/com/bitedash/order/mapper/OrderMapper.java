package com.bitedash.order.mapper;

import com.bitedash.order.dto.request.OrderItemRequest;
import com.bitedash.order.dto.request.OrderRequest;
import com.bitedash.order.dto.response.OrderItemResponse;
import com.bitedash.order.dto.response.OrderResponse;
import com.bitedash.order.dto.response.OrderStatusHistoryResponse;
import com.bitedash.order.entity.Order;
import com.bitedash.order.entity.OrderItem;
import com.bitedash.order.entity.OrderStatusHistory;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

	public static OrderResponse toResponse(Order order) {
		if (order == null) return null;

		OrderResponse response = new OrderResponse();
		response.setId(order.getId());
		response.setOrderNumber(order.getOrderNumber());
		response.setQrCodeData(order.getQrCodeData());
		response.setUserId(order.getUserId());
		response.setVendorId(order.getVendorId());
		response.setCafeteriaId(order.getCafeteriaId());
		response.setOfficeId(order.getOfficeId());
		response.setOrganizationId(order.getOrganizationId());
		response.setTotalAmount(order.getTotalAmount());
		response.setPlatformCommission(order.getPlatformCommission());
		response.setVendorPayout(order.getVendorPayout());
		response.setDeliveryFee(order.getDeliveryFee());
		response.setCommissionRate(order.getCommissionRate());
		response.setStatus(order.getStatus());
		response.setOrderType(order.getOrderType());
		response.setPickupOtp(order.getPickupOtp());
		response.setScheduledTime(order.getScheduledTime());
		response.setPreparationTime(order.getPreparationTime());
		response.setSpecialInstructions(order.getSpecialInstructions());
		response.setRating(order.getRating());
		response.setFeedback(order.getFeedback());
		response.setCreatedAt(order.getCreatedAt());
		response.setUpdatedAt(order.getUpdatedAt());

		if (order.getOrderItems() != null) {
			response.setOrderItems(
				order.getOrderItems().stream()
					.map(OrderMapper::toItemResponse)
					.collect(Collectors.toList())
			);
		}

		return response;
	}

	public static Order toEntity(OrderRequest request) {
		if (request == null) return null;

		Order order = new Order();
		order.setVendorId(request.getVendorId());
		order.setCafeteriaId(request.getCafeteriaId());
		order.setOfficeId(request.getOfficeId());
		order.setTotalAmount(request.getTotalAmount());
		order.setOrderType(request.getOrderType());
		order.setScheduledTime(request.getScheduledTime());
		order.setSpecialInstructions(request.getSpecialInstructions());

		if (request.getItems() != null) {
			for (OrderItemRequest itemRequest : request.getItems()) {
				OrderItem item = toItemEntity(itemRequest);
				order.addOrderItem(item);
			}
		}

		return order;
	}

	public static OrderItemResponse toItemResponse(OrderItem item) {
		if (item == null) return null;

		OrderItemResponse response = new OrderItemResponse();
		response.setId(item.getId());
		response.setMenuItemId(item.getMenuItemId());
		response.setMenuItemName(item.getMenuItemName());
		response.setQuantity(item.getQuantity());
		response.setUnitPrice(item.getUnitPrice());
		response.setAddonIds(item.getAddonIds());
		response.setCustomizations(item.getCustomizations());
		response.setNotes(item.getNotes());
		response.setSubtotal(item.getSubtotal());

		return response;
	}

	public static OrderItem toItemEntity(OrderItemRequest request) {
		if (request == null) return null;

		OrderItem item = new OrderItem();
		item.setMenuItemId(request.getMenuItemId());
		item.setMenuItemName(request.getMenuItemName());
		item.setQuantity(request.getQuantity());
		item.setUnitPrice(request.getUnitPrice());
		item.setAddonIds(request.getAddonIds());
		item.setCustomizations(request.getCustomizations());
		item.setNotes(request.getNotes());

		if (request.getQuantity() != null && request.getUnitPrice() != null) {
			item.setSubtotal(request.getUnitPrice().multiply(java.math.BigDecimal.valueOf(request.getQuantity())));
		}

		return item;
	}

	public static OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
		if (history == null) return null;

		OrderStatusHistoryResponse response = new OrderStatusHistoryResponse();
		response.setId(history.getId());
		response.setOrderId(history.getOrder() != null ? history.getOrder().getId() : null);
		response.setPreviousStatus(history.getPreviousStatus());
		response.setNewStatus(history.getNewStatus());
		response.setChangedBy(history.getChangedBy());
		response.setChangedByRole(history.getChangedByRole());
		response.setRemarks(history.getRemarks());
		response.setCreatedAt(history.getCreatedAt());

		return response;
	}

	public static List<OrderResponse> toResponseList(List<Order> orders) {
		return orders.stream()
			.map(OrderMapper::toResponse)
			.collect(Collectors.toList());
	}

	public static List<OrderStatusHistoryResponse> toHistoryResponseList(List<OrderStatusHistory> histories) {
		return histories.stream()
			.map(OrderMapper::toHistoryResponse)
			.collect(Collectors.toList());
	}
}
