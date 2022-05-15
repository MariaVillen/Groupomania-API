// Name and LastName validation

const { is } = require("express/lib/request");



exports.validation = (() => {

    const isEmail = new RegExp(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/);
    const isPassword = new RegExp(/^[a-z0-9_*@\-]{6,18}$/);
    const isName = new RegExp(/^[A-Za-zàâçéèêëîïôûùüÿñæœ'](?:[A-Za-zàâçéèêëîïôûùüÿñæœ']+| {1}(?=[A-Za-zàâçéèêëîïôûùüÿñæœ']))+/); // no white space at begining or end or more than one space between lettres
    const isBoolean =  new RegExp(/[0|1]/);
    
    const cleanWhiteSpace =  (str)=> {
        const reg = /\s{2,}/;
        const newstr = str.replace(reg," ");
        return newstr;
    }

    return {
        isEmail: (str)=>{
            const sanitizedStr = cleanWhiteSpace(str.trim().toLowerCase());
            const isValid = isEmail.test(sanitizedStr);
            if (isValid) {return sanitizedStr} else { throw new Error("Le email doit etre dans un format valide.")}
        },
        isPassword: (str)=>{
            const isValid = isPassword.test(str);
            if (isValid) {return str} else { throw new Error ("Le mot de pas doit avoir entre 6 et 18 characteres.")}
        },
        isName: (str)=> {
            const sanitizedStr = cleanWhiteSpace(str);
            console.log(sanitizedStr, sanitizedStr.match(isName)[0]);
            const isValid = sanitizedStr.match(isName)[0]===sanitizedStr;
            if (isValid) {return sanitizedStr} else { throw new Error ("Le nom ou prénom ne doivent pas avoir de nombres.")}
        },
        isBoolean: (str)=> {
            const sanitizedStr = parseInt(str);
            const isValid = isBoolean.test(sanitizedStr);
            if (isValid) {return sanitizedStr} else { throw new Error ("Le value doit etre 0 ou 1.")}
        },
        cleanWhiteSpace: (str)=> {cleanWhiteSpace(str)}
    }

})();

