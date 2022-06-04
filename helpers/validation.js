// Validation function helper

exports.validation = ( () => {

  const isEmail = new RegExp(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/);

  const isPassword = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!$%@\.]).{8,24}$/);

  const isName = new RegExp(/^[A-Za-zàâçéèêëîïôûùüÿñæœ'](?:[A-Za-zàâçéèêëîïôûùüÿñæœ']+| {1}(?=[A-Za-zàâçéèêëîïôûùüÿñæœ']))+/); // no white space at begining or end or more than one space between lettres

  const cleanWhiteSpace = (str) => {
    const reg = /\s{2,}/;
    return str.replace(reg, " ").trim();
  };

  return {

    isEmail: ( str ) => {
      const sanitizedStr = cleanWhiteSpace( str.toLowerCase() );
      const isValid = isEmail.test( sanitizedStr );
      if ( isValid ) {
        return sanitizedStr;
      } else {
        throw new Error("L'email doit etre dans un format valide.");
      }
    },

    isPassword: ( str ) => {
      const isValid = isPassword.test( str );
      if ( isValid ) {
        return str;
      } else {
        throw new Error("Le mot de pas doit avoir entre 8 et 24 characteres.");
      }
    },

    isName: ( str ) => {
      const sanitizedStr = cleanWhiteSpace( str );
      const isValid = sanitizedStr.match( isName )[0] === sanitizedStr;
      if ( isValid ) {
        return sanitizedStr;
      } else {
        throw new Error("Le nom ou prénom ne doivent pas avoir de nombres.");
      }
    },

    cleanWhiteSpace: ( str ) => {
      return cleanWhiteSpace( str );
    }

  }
})();
