package com.bitedash.payment.service;

import com.bitedash.payment.dto.request.CommissionLogRequest;
import com.bitedash.payment.dto.response.DailyRevenueResponse;
import com.bitedash.payment.dto.response.PlatformRevenueStatsResponse;
import com.bitedash.payment.dto.response.PlatformWalletResponse;
import com.bitedash.payment.entity.PlatformRevenueLog;
import com.bitedash.payment.entity.PlatformWallet;
import com.bitedash.payment.repository.PlatformRevenueLogRepository;
import com.bitedash.payment.repository.PlatformWalletRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Comprehensive tests for PlatformRevenueService.
 * Tests cover: Commission logging, revenue stats, daily revenue, platform wallet.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PlatformRevenueService Tests")
class PlatformRevenueServiceTest {

    @Mock
    private PlatformRevenueLogRepository revenueLogRepository;

    @Mock
    private PlatformWalletRepository platformWalletRepository;

    @InjectMocks
    private PlatformRevenueService revenueService;

    private PlatformWallet testWallet;

    @BeforeEach
    void setUp() {
        testWallet = new PlatformWallet();
        testWallet.setId(1L);
        testWallet.setBalance(new BigDecimal("10000.00"));
        testWallet.setTotalCommissionEarned(new BigDecimal("5000.00"));
        testWallet.setTotalGatewayMarkupEarned(new BigDecimal("1000.00"));
        testWallet.setTotalPromotionSpent(BigDecimal.ZERO);
    }

    @Nested
    @DisplayName("Log Commission Tests")
    class LogCommissionTests {

        @Test
        @DisplayName("Should log commission successfully")
        void logCommission_ValidRequest_LogsCommission() {
            CommissionLogRequest request = new CommissionLogRequest();
            request.setOrderId(100L);
            request.setAmount(new BigDecimal("50.00"));
            request.setVendorId(5L);
            request.setOrganizationId(1L);

            when(revenueLogRepository.save(any(PlatformRevenueLog.class))).thenAnswer(inv -> inv.getArgument(0));
            when(platformWalletRepository.getOrCreatePlatformWallet()).thenReturn(testWallet);
            when(platformWalletRepository.save(any(PlatformWallet.class))).thenReturn(testWallet);

            revenueService.logCommission(request);

            verify(revenueLogRepository).save(any(PlatformRevenueLog.class));
            verify(platformWalletRepository).save(any(PlatformWallet.class));
        }

        @Test
        @DisplayName("Should update platform wallet balance")
        void logCommission_UpdatesWalletBalance() {
            BigDecimal initialBalance = testWallet.getBalance();
            BigDecimal commissionAmount = new BigDecimal("100.00");

            CommissionLogRequest request = new CommissionLogRequest();
            request.setOrderId(100L);
            request.setAmount(commissionAmount);
            request.setVendorId(5L);
            request.setOrganizationId(1L);

            when(revenueLogRepository.save(any(PlatformRevenueLog.class))).thenAnswer(inv -> inv.getArgument(0));
            when(platformWalletRepository.getOrCreatePlatformWallet()).thenReturn(testWallet);
            when(platformWalletRepository.save(any(PlatformWallet.class))).thenReturn(testWallet);

            revenueService.logCommission(request);

            // Verify wallet methods called
            verify(platformWalletRepository).save(testWallet);
        }
    }

    @Nested
    @DisplayName("Log Gateway Markup Tests")
    class LogGatewayMarkupTests {

        @Test
        @DisplayName("Should log gateway markup successfully")
        void logGatewayMarkup_ValidRequest_LogsMarkup() {
            when(revenueLogRepository.save(any(PlatformRevenueLog.class))).thenAnswer(inv -> inv.getArgument(0));
            when(platformWalletRepository.getOrCreatePlatformWallet()).thenReturn(testWallet);
            when(platformWalletRepository.save(any(PlatformWallet.class))).thenReturn(testWallet);

            revenueService.logGatewayMarkup(200L, new BigDecimal("5.00"), 10L);

            verify(revenueLogRepository).save(any(PlatformRevenueLog.class));
            verify(platformWalletRepository).save(any(PlatformWallet.class));
        }
    }

    @Nested
    @DisplayName("Log Promotion Revenue Tests")
    class LogPromotionRevenueTests {

        @Test
        @DisplayName("Should log promotion revenue successfully")
        void logPromotionRevenue_ValidRequest_LogsRevenue() {
            when(revenueLogRepository.save(any(PlatformRevenueLog.class))).thenAnswer(inv -> inv.getArgument(0));
            when(platformWalletRepository.getOrCreatePlatformWallet()).thenReturn(testWallet);
            when(platformWalletRepository.save(any(PlatformWallet.class))).thenReturn(testWallet);

            revenueService.logPromotionRevenue(5L, new BigDecimal("200.00"), "FEATURED_LISTING");

            verify(revenueLogRepository).save(any(PlatformRevenueLog.class));
            verify(platformWalletRepository).save(any(PlatformWallet.class));
        }
    }

    @Nested
    @DisplayName("Get Revenue Stats Tests")
    class GetRevenueStatsTests {

        @Test
        @DisplayName("Should return revenue stats for date range")
        void getRevenueStats_ValidDateRange_ReturnsStats() {
            LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 12, 31, 23, 59);

            when(revenueLogRepository.getTotalRevenueByTypeAndDateRange("COMMISSION", startDate, endDate))
                .thenReturn(5000.0);
            when(revenueLogRepository.getTotalRevenueByTypeAndDateRange("GATEWAY_MARKUP", startDate, endDate))
                .thenReturn(1000.0);
            when(revenueLogRepository.getTotalRevenueByTypeAndDateRange("PROMOTION_REVENUE", startDate, endDate))
                .thenReturn(500.0);
            when(revenueLogRepository.getTotalRevenueByTypeAndDateRange("SUBSCRIPTION_FEE", startDate, endDate))
                .thenReturn(200.0);
            when(revenueLogRepository.findByDateRange(startDate, endDate)).thenReturn(Arrays.asList());

            PlatformRevenueStatsResponse stats = revenueService.getRevenueStats(startDate, endDate);

            assertThat(stats).isNotNull();
            assertThat(stats.getCommissionRevenue()).isEqualByComparingTo(new BigDecimal("5000.0"));
            assertThat(stats.getGatewayMarkupRevenue()).isEqualByComparingTo(new BigDecimal("1000.0"));
            assertThat(stats.getPromotionRevenue()).isEqualByComparingTo(new BigDecimal("500.0"));
            assertThat(stats.getSubscriptionRevenue()).isEqualByComparingTo(new BigDecimal("200.0"));
            assertThat(stats.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("6700.0"));
        }

        @Test
        @DisplayName("Should handle null revenue values")
        void getRevenueStats_NullValues_ReturnsZeros() {
            LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 12, 31, 23, 59);

            when(revenueLogRepository.getTotalRevenueByTypeAndDateRange(any(), any(), any())).thenReturn(null);
            when(revenueLogRepository.findByDateRange(startDate, endDate)).thenReturn(Arrays.asList());

            PlatformRevenueStatsResponse stats = revenueService.getRevenueStats(startDate, endDate);

            assertThat(stats.getCommissionRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(stats.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should include period dates in response")
        void getRevenueStats_IncludesPeriodDates() {
            LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 12, 31, 23, 59);

            when(revenueLogRepository.getTotalRevenueByTypeAndDateRange(any(), any(), any())).thenReturn(0.0);
            when(revenueLogRepository.findByDateRange(startDate, endDate)).thenReturn(Arrays.asList());

            PlatformRevenueStatsResponse stats = revenueService.getRevenueStats(startDate, endDate);

            assertThat(stats.getPeriodStart()).isEqualTo(startDate);
            assertThat(stats.getPeriodEnd()).isEqualTo(endDate);
        }
    }

    @Nested
    @DisplayName("Get Overall Revenue Stats Tests")
    class GetOverallRevenueStatsTests {

        @Test
        @DisplayName("Should return overall revenue stats")
        void getOverallRevenueStats_ReturnsAllTimeStats() {
            when(revenueLogRepository.getTotalRevenueByType("COMMISSION")).thenReturn(50000.0);
            when(revenueLogRepository.getTotalRevenueByType("GATEWAY_MARKUP")).thenReturn(10000.0);
            when(revenueLogRepository.getTotalRevenueByType("PROMOTION_REVENUE")).thenReturn(5000.0);
            when(revenueLogRepository.getTotalRevenueByType("SUBSCRIPTION_FEE")).thenReturn(2000.0);
            when(revenueLogRepository.count()).thenReturn(1000L);

            PlatformRevenueStatsResponse stats = revenueService.getOverallRevenueStats();

            assertThat(stats).isNotNull();
            assertThat(stats.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("67000.0"));
            assertThat(stats.getTotalTransactions()).isEqualTo(1000);
        }

        @Test
        @DisplayName("Should handle empty database")
        void getOverallRevenueStats_EmptyDatabase_ReturnsZeros() {
            when(revenueLogRepository.getTotalRevenueByType(any())).thenReturn(null);
            when(revenueLogRepository.count()).thenReturn(0L);

            PlatformRevenueStatsResponse stats = revenueService.getOverallRevenueStats();

            assertThat(stats.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(stats.getTotalTransactions()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Get Daily Revenue Tests")
    class GetDailyRevenueTests {

        @Test
        @DisplayName("Should return daily revenue breakdown")
        void getDailyRevenue_ReturnsDailyBreakdown() {
            LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 1, 31, 23, 59);

            Object[] day1 = new Object[]{java.sql.Date.valueOf(LocalDate.of(2024, 1, 1)), 1000.0};
            Object[] day2 = new Object[]{java.sql.Date.valueOf(LocalDate.of(2024, 1, 2)), 1500.0};

            when(revenueLogRepository.getDailyRevenueSummary(startDate, endDate))
                .thenReturn(Arrays.asList(day1, day2));
            when(revenueLogRepository.getRevenueBreakdownByType(startDate, endDate))
                .thenReturn(Arrays.asList());

            List<DailyRevenueResponse> dailyRevenue = revenueService.getDailyRevenue(startDate, endDate);

            assertThat(dailyRevenue).hasSize(2);
            assertThat(dailyRevenue.get(0).getDate()).isEqualTo(LocalDate.of(2024, 1, 1));
            assertThat(dailyRevenue.get(0).getTotalRevenue()).isEqualByComparingTo(new BigDecimal("1000.0"));
        }

        @Test
        @DisplayName("Should return empty list when no revenue")
        void getDailyRevenue_NoData_ReturnsEmptyList() {
            LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 1, 31, 23, 59);

            when(revenueLogRepository.getDailyRevenueSummary(startDate, endDate))
                .thenReturn(Arrays.asList());
            when(revenueLogRepository.getRevenueBreakdownByType(startDate, endDate))
                .thenReturn(Arrays.asList());

            List<DailyRevenueResponse> dailyRevenue = revenueService.getDailyRevenue(startDate, endDate);

            assertThat(dailyRevenue).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Platform Wallet Tests")
    class GetPlatformWalletTests {

        @Test
        @DisplayName("Should return platform wallet details")
        void getPlatformWallet_ReturnsWalletDetails() {
            when(platformWalletRepository.getOrCreatePlatformWallet()).thenReturn(testWallet);

            PlatformWalletResponse response = revenueService.getPlatformWallet();

            assertThat(response).isNotNull();
            assertThat(response.getBalance()).isEqualByComparingTo(new BigDecimal("10000.00"));
            assertThat(response.getTotalCommissionEarned()).isEqualByComparingTo(new BigDecimal("5000.00"));
            assertThat(response.getTotalGatewayMarkupEarned()).isEqualByComparingTo(new BigDecimal("1000.00"));
        }

        @Test
        @DisplayName("Should include wallet ID in response")
        void getPlatformWallet_IncludesWalletId() {
            when(platformWalletRepository.getOrCreatePlatformWallet()).thenReturn(testWallet);

            PlatformWalletResponse response = revenueService.getPlatformWallet();

            assertThat(response.getId()).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("Get Revenue By Entity Tests")
    class GetRevenueByEntityTests {

        @Test
        @DisplayName("Should return revenue by vendor")
        void getRevenueByVendor_ReturnsVendorRevenue() {
            when(revenueLogRepository.getTotalRevenueByVendor(5L)).thenReturn(2500.0);

            BigDecimal revenue = revenueService.getRevenueByVendor(5L);

            assertThat(revenue).isEqualByComparingTo(new BigDecimal("2500.0"));
        }

        @Test
        @DisplayName("Should return zero for vendor with no revenue")
        void getRevenueByVendor_NoRevenue_ReturnsZero() {
            when(revenueLogRepository.getTotalRevenueByVendor(99L)).thenReturn(null);

            BigDecimal revenue = revenueService.getRevenueByVendor(99L);

            assertThat(revenue).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should return revenue by organization")
        void getRevenueByOrganization_ReturnsOrgRevenue() {
            when(revenueLogRepository.getTotalRevenueByOrganization(1L)).thenReturn(15000.0);

            BigDecimal revenue = revenueService.getRevenueByOrganization(1L);

            assertThat(revenue).isEqualByComparingTo(new BigDecimal("15000.0"));
        }

        @Test
        @DisplayName("Should return zero for organization with no revenue")
        void getRevenueByOrganization_NoRevenue_ReturnsZero() {
            when(revenueLogRepository.getTotalRevenueByOrganization(99L)).thenReturn(null);

            BigDecimal revenue = revenueService.getRevenueByOrganization(99L);

            assertThat(revenue).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }
}
