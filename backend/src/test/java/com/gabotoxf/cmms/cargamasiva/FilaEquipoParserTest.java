package com.gabotoxf.cmms.cargamasiva;

import com.gabotoxf.cmms.equipo.ClasificacionRiesgo;
import com.gabotoxf.cmms.equipo.EstadoEquipo;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Fase 10: validación de filas del archivo de carga masiva. Es la primera
 * línea de defensa contra basura en el inventario: cada mensaje de error
 * termina en el reporte que el usuario ve.
 */
class FilaEquipoParserTest {

    @Test
    @DisplayName("Parsea una fila completa y correcta")
    void filaCompleta() {
        String[] celdas = {"EQ-100", "Bomba de infusión", "Brand", "X200",
                "UCI Neonatal", "IIB", "2025-03-15", "120", "OPERATIVO"};

        EquipoRequest request = FilaEquipoParser.parsear(2, celdas);

        assertThat(request.serial()).isEqualTo("EQ-100");
        assertThat(request.clasificacionRiesgo()).isEqualTo(ClasificacionRiesgo.IIB);
        assertThat(request.fechaAdquisicion()).isEqualTo(LocalDate.of(2025, 3, 15));
        assertThat(request.periodicidadMantenimientoDias()).isEqualTo(120);
    }

    @Test
    @DisplayName("Los campos opcionales (marca, modelo, fecha) pueden venir vacíos")
    void camposOpcionalesVacios() {
        String[] celdas = {"EQ-100", "Bomba de infusión", "", "", "UCI", "IIA", "", "30", ""};

        EquipoRequest request = FilaEquipoParser.parsear(2, celdas);

        assertThat(request.marca()).isNull();
        assertThat(request.modelo()).isNull();
        assertThat(request.fechaAdquisicion()).isNull();
    }

    @Test
    @DisplayName("Sin serial falla con mensaje claro")
    void sinSerial() {
        String[] celdas = {"", "Bomba", "", "", "UCI", "IIB", "", "30", ""};

        assertThatThrownBy(() -> FilaEquipoParser.parsear(3, celdas))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("serial es obligatorio");
    }

    @Test
    @DisplayName("Riesgo fuera del catálogo de la Res. 3100 falla")
    void riesgoInvalido() {
        String[] celdas = {"EQ-100", "Bomba", "", "", "UCI", "IV", "", "30", ""};

        assertThatThrownBy(() -> FilaEquipoParser.parsear(3, celdas))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("riesgo inválido")
                .hasMessageContaining("IV");
    }

    @Test
    @DisplayName("Fecha con formato incorrecto falla indicando el formato esperado")
    void fechaInvalida() {
        String[] celdas = {"EQ-100", "Bomba", "", "", "UCI", "IIB", "15/03/2025", "30", ""};

        assertThatThrownBy(() -> FilaEquipoParser.parsear(3, celdas))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AAAA-MM-DD");
    }

    @Test
    @DisplayName("Periodicidad no numérica falla")
    void periodicidadInvalida() {
        String[] celdas = {"EQ-100", "Bomba", "", "", "UCI", "IIB", "", "mensual", ""};

        assertThatThrownBy(() -> FilaEquipoParser.parsear(3, celdas))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("periodicidad inválida");
    }

    @Test
    @DisplayName("Periodicidad cero o negativa falla")
    void periodicidadCero() {
        String[] celdas = {"EQ-100", "Bomba", "", "", "UCI", "IIB", "", "0", ""};

        assertThatThrownBy(() -> FilaEquipoParser.parsear(3, celdas))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("al menos 1 día");
    }

    @Test
    @DisplayName("Estado fuera del catálogo falla")
    void estadoInvalido() {
        String[] celdas = {"EQ-100", "Bomba", "", "", "UCI", "IIB", "", "30", "ROTO"};

        assertThatThrownBy(() -> FilaEquipoParser.parsear(3, celdas))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("estado inválido");
    }

    @Test
    @DisplayName("El estado de la fila válido pasa la validación del parser")
    void estadoValido() {
        String[] celdas = {"EQ-100", "Bomba", "", "", "UCI", "III", "", "30", "EN_MANTENIMIENTO"};

        // No lanza: el estado EN_MANTENIMIENTO está dentro del catálogo
        EquipoRequest request = FilaEquipoParser.parsear(2, celdas);

        assertThat(request.clasificacionRiesgo()).isEqualTo(ClasificacionRiesgo.III);
        assertThat(EstadoEquipo.valueOf("EN_MANTENIMIENTO")).isEqualTo(EstadoEquipo.EN_MANTENIMIENTO);
    }
}
