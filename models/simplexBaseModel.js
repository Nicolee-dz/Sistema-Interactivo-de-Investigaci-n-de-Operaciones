class simplexBaseModel{
    calcularZj(tabla,cb){
        const vectorZj=[];
        for(let i=0;i<tabla[0].length;i++){
            let suma=0;
            for(let j=0;j<cb.length;j++) suma+=cb[j]*tabla[j][i];
            vectorZj.push(suma);
        }
        return vectorZj;
    }
    escogerPivote(tabla,columna){
        let pivote=-1,min=Infinity;
        for(let i=0;i<tabla.length;i++){
            const d=tabla[i][columna];
            if(d>0){const c=tabla[i][tabla[0].length-1]/d;if(c<min){min=c;pivote=i;}}
        }
        return pivote;
    }
    pivotear(tabla,fila,columna){
        let p=tabla[fila][columna];
        for(let j=0;j<tabla[0].length;j++) tabla[fila][j]/=p;
        for(let i=0;i<tabla.length;i++){
            if(i!==fila){let f=tabla[i][columna];for(let j=0;j<tabla[0].length;j++) tabla[i][j]-=f*tabla[fila][j];}
        }
        return tabla;
    }
    construirMatrizBase(tabla, base, encabezados) {

    const B = [];

    for (let i = 0; i < base.length; i++) {

      const nombreVar = base[i];

      const j = encabezados.indexOf(nombreVar);

      const columna = tabla.map(f => f[j]);

      B.push(columna);
    }

    return this.transponer(B);
  }

  transponer(matriz) {

    return matriz[0].map((_, j) =>
      matriz.map(fila => fila[j])
    );
  }

  invertirMatriz(A) {

    const n = A.length;

    const I = [];
    const C = [];

    for (let i = 0; i < n; i++) {

      I[i] = [];
      C[i] = [];

      for (let j = 0; j < n; j++) {

        if (i === j) {
          I[i][j] = 1;
        } else {
          I[i][j] = 0;
        }

        C[i][j] = A[i][j];
      }
    }

    for (let i = 0; i < n; i++) {

      let e = C[i][i];

      if (e === 0) {

        for (let ii = i + 1; ii < n; ii++) {

          if (C[ii][i] !== 0) {

            for (let j = 0; j < n; j++) {

              let temp = C[i][j];
              C[i][j] = C[ii][j];
              C[ii][j] = temp;

              temp = I[i][j];
              I[i][j] = I[ii][j];
              I[ii][j] = temp;
            }

            break;
          }
        }

        e = C[i][i];
      }

      for (let j = 0; j < n; j++) {

        C[i][j] = C[i][j] / e;
        I[i][j] = I[i][j] / e;
      }

      for (let ii = 0; ii < n; ii++) {

        if (ii === i) continue;

        const f = C[ii][i];

        for (let j = 0; j < n; j++) {

          C[ii][j] -= f * C[i][j];
          I[ii][j] -= f * I[i][j];
        }
      }
    }

    return I;
  }

  multiplicarMatrices(A, B) {

    const filasA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;

    const resultado = [];

    for (let i = 0; i < filasA; i++) {

      resultado[i] = [];

      for (let j = 0; j < colsB; j++) {

        let suma = 0;

        for (let k = 0; k < colsA; k++) {

          suma += A[i][k] * B[k][j];
        }

        resultado[i][j] = suma;
      }
    }

    return resultado;
  }
}
