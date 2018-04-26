
function phoneVal(val) {
    return /d{10}/.test(val);
}

var phoneValidator = [phoneVal, '{VALUE} is not a valid 10 digit phone number!'];

module.exports = phoneValidator;