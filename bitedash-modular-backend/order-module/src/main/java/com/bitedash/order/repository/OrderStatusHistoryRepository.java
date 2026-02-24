package com.bitedash.order.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bitedash.order.entity.OrderStatusHistory;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {

	List<OrderStatusHistory> findByOrder_Id(Long orderId);

}
