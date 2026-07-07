package com.tienda.backend.service;

import com.tienda.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final CompraRepository compraRepository;
    private final InventarioRepository inventarioRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // KPIs principales
        BigDecimal totalHoy = ventaRepository.totalVentasHoy();
        stats.put("ventasHoy", totalHoy != null ? totalHoy : BigDecimal.ZERO);
        stats.put("totalVentas", ventaRepository.count());
        stats.put("totalProductos", productoRepository.countByActivoTrue());
        stats.put("totalClientes", clienteRepository.count());
        stats.put("comprasPendientes", compraRepository.findComprasPendientes().size());

        // Productos con stock bajo
        List<Object> stockBajo = new ArrayList<>();
        productoRepository.findProductosStockBajo().forEach(p -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("nombre", p.getNombre());
            item.put("stockActual", p.getStockActual());
            item.put("stockMinimo", p.getStockMinimo());
            stockBajo.add(item);
        });
        stats.put("productosStockBajo", stockBajo);
        stats.put("alertasStock", stockBajo.size());

        // Ventas por mes (año actual)
        int anioActual = LocalDateTime.now().getYear();
        List<Object[]> ventasPorMes = ventaRepository.totalVentasPorMes(anioActual);
        Map<Integer, BigDecimal> ventasMes = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) ventasMes.put(m, BigDecimal.ZERO);
        for (Object[] row : ventasPorMes) {
            ventasMes.put((Integer) row[0], (BigDecimal) row[1]);
        }
        stats.put("ventasPorMes", ventasMes);

        // Top 5 productos más vendidos
        List<Map<String, Object>> topProductos = new ArrayList<>();
        for (Object[] row : productoRepository.countByCategorias()) {
            Map<String, Object> item = new HashMap<>();
            item.put("categoria", row[0]);
            item.put("cantidad", row[1]);
            topProductos.add(item);
        }
        stats.put("productosPorCategoria", topProductos);

        return stats;
    }
}
