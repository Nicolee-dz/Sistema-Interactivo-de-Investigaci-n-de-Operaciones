class simplexMaxModel extends simplexBaseModel{

    maximizar(objetivo, restricciones, rhs) {
        let numVar=restricciones[0].length; //numero de variables
        let cb=[]; //coeficientes de las variables en la base
        let base=[]; //nombre de las variables en la base
        for(let i=0;i<restricciones.length;i++){
            cb.push(0); //empiezan las variables de holgura en la base
            base.push("s"+ (i+1));
        }
        const funcionObj=this.agregarHolguras(objetivo,restricciones);
        let tabla = this.llenarTablaMax(restricciones,rhs);
        let optimo=false;
        while(!optimo){
            let columna=this.buscarVariableEntrante(tabla,cb,funcionObj); //variable que entra
            if(columna==-1){ //cuando la columna es -1, ya es optimo
                optimo=true;
                break;
            }else{
                let fila=this.escogerPivote(tabla,columna); //variable que sale
                cb=this.cambiarBase(cb,base,columna,fila,funcionObj,numVar);
                tabla=this.pivotear(tabla,fila,columna);
            }
        }
        const solucion = {};
        for(let i = 0; i < numVar; i++) { //Inicializa todas las variables en 0
            solucion["x" + (i + 1)] = 0;
        }
        for(let i = 0; i < base.length; i++) { //Pone la solución en el objeto
            solucion[base[i]] =
            tabla[i][tabla[0].length - 1];
        }
        const zj = this.calcularZj(tabla, cb);
        const zOptimo = zj[tabla[0].length - 1];
        return {zOptimo,variables: solucion};
    }

    buscarVariableEntrante(tabla,cb,funcionObj){
        const zj=this.calcularZj(tabla,cb);
        let maxValor = 0;
        let indice = -1;
        for (let i = 0; i < funcionObj.length-1; i++) { //Busca en todas las variables, omite el vector de recursos
            let valor = funcionObj[i] - zj[i];
            if (valor > maxValor) {
                maxValor = valor;
                indice = i;
            }
        }
        return indice;
    }

    llenarTablaMax(restricciones,rhs){ //llena la tabla por primera vez
        const matriz=[];
        for (let i = 0; i < restricciones.length; i++) { //numero de restricciones o filas
            const fila = [];
            for (let j = 0; j < restricciones[0].length; j++) { //numero de variables o columnas
                let val   = restricciones[i][j];
                fila.push(val);
            }
            for(let k=0;k<restricciones.length;k++){ //variables de holgura
                if (i === k) {
                    fila.push(1);
                } else {
                    fila.push(0);
                }
            }
            fila.push(rhs[i]);//vector de los recursos
            matriz.push(fila);
        }
        return matriz;
    }

    agregarHolguras(objetivo,restricciones){ //hace la nueva funcion objetivo
        let funcionObj=[];
        for(let i =0;i<objetivo.length;i++){ //coeficientes de la funcion objetivo
            funcionObj.push(objetivo[i]);
        }
        for(let k=0;k<restricciones.length;k++){ //coeficientes variables de holgura
            funcionObj.push(0);
        }
        funcionObj.push(0);
        return funcionObj;
    }

    cambiarBase(cb,base,columna,fila,funcionObj,numVar){ //cambia las variables en la base
        cb[fila]=funcionObj[columna];
        base[fila]=this.obtenerNombreVariable(columna,numVar);
        return cb;
    }

    obtenerNombreVariable(columna,numVar) { //obtiene el nombre de las variables
        if(columna < numVar) {
            return "x" + (columna + 1);
        }
        return "s" + (columna - numVar + 1);
    }
}