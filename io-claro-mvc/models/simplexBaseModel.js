// Métodos generales que se usan para maximizar y minimizar
class simplexBaseModel{

    calcularZj(tabla,cb){
        const vectorZj=[];
        for(let i=0;i<tabla[0].length;i++){
            let suma=0;
            for(let j=0;j<cb.length;j++){
                suma+=cb[j]*tabla[j][i];
            }
            vectorZj.push(suma);
        }
        return vectorZj;
    }

    escogerPivote(tabla, columna) { //escoge la fila para encontrar el pivote
        let pivote = -1;
        let min = Infinity;
        for (let i = 0; i < tabla.length; i++) {
            const divisor = tabla[i][columna];
            if (divisor > 0) {
                const cociente = tabla[i][tabla[0].length - 1] / divisor;
                if (cociente < min) {
                    min = cociente;
                    pivote = i;
                }
            }
        }
        return pivote;
    }

    pivotear(tabla,fila,columna){
        let pivote = tabla[fila][columna];
        for (let j = 0; j < tabla[0].length; j++) { //hacer 1 el pivote
            tabla[fila][j] /= pivote;
        }
        for (let i = 0; i < tabla.length; i++) { //hacer 0 esa columna
            if (i !== fila) {
                let factor = tabla[i][columna];
                for (let j = 0; j < tabla[0].length; j++) {
                    tabla[i][j] -= factor * tabla[fila][j];
                }
            }
        }
        return tabla;
    }
}