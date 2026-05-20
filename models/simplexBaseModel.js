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
}
