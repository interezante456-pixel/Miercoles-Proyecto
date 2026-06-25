$entities = @("Almacen.java", "Categoria.java", "Proveedor.java", "Rol.java", "Venta.java", "Compra.java", "DetalleVenta.java", "DetalleCompra.java")
foreach ($ent in $entities) {
    $path = "C:\Users\Dell\Documents\Miercoles-Proyecto\backend\src\main\java\com\tienda\backend\entity\$ent"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -notmatch "com.fasterxml.jackson.annotation.JsonIgnore") {
            $content = $content -replace "(import java\.util\.[a-zA-Z]+;)", "`$1`nimport com.fasterxml.jackson.annotation.JsonIgnore;"
            $content = $content -replace "(    @OneToMany)", "    @JsonIgnore`n`$1"
            $content = $content -replace "(    @ManyToMany)", "    @JsonIgnore`n`$1"
            if ($ent -match "^Detalle") {
                $content = $content -replace "(    @ManyToOne\(fetch = FetchType\.LAZY\))", "    @JsonIgnore`n`$1"
            }
            Set-Content -Path $path -Value $content
            Write-Host "Updated $ent"
        }
    }
}
