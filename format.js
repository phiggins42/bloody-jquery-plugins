/**
 *       jquery.numberformatter - Formatting/Parsing Numbers in jQuery
 *       Completely changed by Peter Higgins (dante@dojotoolkit.org)
 *       Originally written by Michael Abernethy (mike@abernethysoft.com)
 *
 *       This plugin can be used to format numbers as text and parse text as Numbers
 *       Because we live in an international world, we cannot assume that everyone
 *       uses "," to divide thousands, and "." as a decimal point.
 *      
 *       The format() function will take the text within any selector by calling
 *       text() or val() on them, getting the String, and applying the specified format to it.
 *       It will return the jQuery object
 *      
 *       The parse() function will take the text within any selector by calling text()
 *       or val() on them, turning the String into a Number, and returning these
 *       values in a Number array.
 *       It WILL BREAK the jQuery chain, and return an Array of Numbers.
 *      
 *       Because there is limited use in a plugin that is unable to simply parse strings and numbers
 *       The parsing and formatting section has been broken out into $.formatNumber and $.parseNumber
 *      
 *       The syntax for the formatting is:
 *       0 = Digit
 *       # = Digit, zero shows as absent
 *       . = Decimal separator
 *       - = Negative sign
 *       , = Grouping Separator
 *       % = Percent (multiplies the number by 100)
 *       For example, a format of "#,###.00" and text of 4500.20 will
 *       display as "4.500,20" with a locale of "de", and "4,500.20" with a locale of "us"
 *      
 *      
 *       As of now, the only acceptable locales are 
 *       United States -> "us"
 *       Arab Emirates -> "ae"
 *       Egypt -> "eg"
 *       Israel -> "il"
 *       Japan -> "jp"
 *       South Korea -> "kr"
 *       Thailand -> "th"
 *       China -> "cn"
 *       Hong Kong -> "hk"
 *       Taiwan -> "tw"
 *       Australia -> "au"
 *       Canada -> "ca"
 *       Great Britain -> "gb"
 *       India -> "in"
 *       Germany -> "de"
 *       Vietnam -> "vn"
 *       Spain -> "es"
 *       Denmark -> "dk"
 *       Austria -> "at"
 *       Greece -> "gr"
 *       Brazil -> "br"
 *       Czech -> "cz"
 *       France  -> "fr"
 *       Finland -> "fi"
 *       Russia -> "ru"
 *       Sweden -> "se"
 *       Switzerland -> "ch"
 *       
 *       TODO
 *       Separate positive and negative patterns separated by a ":" (e.g. use (#,###) for accounting)
 *       More options may come in the future (currency)
 **/
(function($){
    
    var defaults = {
        parse:{
            locale: "us",
            decimalSeparatorAlwaysShown: false
        },
        format:{
            format: "#,###.00",
            locale: "us",
            decimalSeparatorAlwaysShown: false
        }
    }
    
    var formatCodes = function(locale) {

        var dec = ".", group = ",", neg = "-";
        switch(locale.toLowerCase()){
            case "de": case "vn": case "es": case "dk": case "at": case "gr": case "br":
                dec = ","; group = ".";
                break;
            case "cz": case "fr": case "fi": case "ru": case "se":
                group = " "; dec = ",";
                break;
            case "ch":
                group = "'";
                break;
        }

        return { group: group, dec: dec, neg: neg }
        
    };

    var formatNumber = function(text, options, dontmix){
        // summary: Format some plain number to a localized printable version
        
        var opts = dontmix ? (options || defaults.format) : $.extend({}, defaults.format, options),
            d = dontmix || formatCodes(opts.locale),
            dec = d.dec, group = d.group, neg = d.neg,
            validFormat = "0#-,.", returnString = ""
        ;

        // strip all the invalid characters at the beginning and the end
        // of the format, and we'll stick them back on at the end
        // make a special case for the negative sign "-" though, so 
        // we can have formats like -$23.32
        var prefix = "", negativeInFront = false;
        for (var i = 0, l = opts.format.length; i < l; i++) {
            if (validFormat.indexOf(opts.format.charAt(i)) == -1) {
                prefix = prefix + opts.format.charAt(i);
            } else if (i == 0 && opts.format.charAt(i) == '-'){
                negativeInFront = true;
                continue;                
            } else {
                break;
            }
        }

        var suffix = "";
        for (var i = opts.format.length - 1; i >= 0; i--) {
            if (validFormat.indexOf(opts.format.charAt(i)) == -1){
                suffix = opts.format.charAt(i) + suffix;
            } else {
                break;
            }

        }

        opts.format = opts.format.substring(prefix.length);
        opts.format = opts.format.substring(0, opts.format.length - suffix.length);

        // now we need to convert it into a number
        while (text.indexOf(group) > -1){
            text = text.replace(group,'');
        }
           
        var number = new Number(text.replace(dec,".").replace(neg,"-"));

        // special case for percentages
        if (suffix == "%") { number *= 100; }

        var decimalValue = number % 1;
        
        if (opts.format.indexOf(".") > -1) {
            var decimalPortion = dec;
            var decimalFormat = opts.format.substring(opts.format.lastIndexOf(".") + 1);
            var decimalString = new String(decimalValue.toFixed(decimalFormat.length));
            decimalString = decimalString.substring(decimalString.lastIndexOf(".") + 1);
            for (var i=0, l = decimalFormat.length; i < l; i++){
                if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) != '0') {
                    decimalPortion += decimalString.charAt(i);
                    continue;
                } else if (decimalFormat.charAt(i) == '#' && decimalString.charAt(i) == '0') {
                    var notParsed = decimalString.substring(i);
                    if (notParsed.match('[1-9]')) {
                        decimalPortion += decimalString.charAt(i);
                        continue;
                    } else {
                        break;
                    }
                } else if (decimalFormat.charAt(i) == "0") {
                    decimalPortion += decimalString.charAt(i);
                }
            }
            
            returnString += decimalPortion;

        } else {
            number = Math.round(number);
        }
           
        var ones = Math.floor(number);
        if (number < 0){
            ones = Math.ceil(number);
        }

        var onePortion = "";
        if (ones == 0) {
            onePortion = "0";
        } else {
            // find how many digits are in the group
            var onesFormat = "";
            if (opts.format.indexOf(".") == -1){
                onesFormat = opts.format;
            } else {
                onesFormat = opts.format.substring(0, opts.format.indexOf("."));
            }

            var oneText = new String(Math.abs(ones));
            var groupLength = 9999;
            if (onesFormat.lastIndexOf(",") != -1) {
                groupLength = onesFormat.length - onesFormat.lastIndexOf(",") - 1;
            }

            var groupCount = 0;
            for (var i = oneText.length - 1; i >- 1; i--) {
                onePortion = oneText.charAt(i) + onePortion;
                groupCount++;
                if (groupCount == groupLength && i!=0) {
                    onePortion = group + onePortion;
                    groupCount = 0;
                }

            }
        }
        
        returnString = onePortion + returnString;

        // handle special case where negative is in front of the invalid
        // characters
        if (number < 0 && negativeInFront && prefix.length > 0) {
            prefix = neg + prefix;
        } else if (number < 0) {
            returnString = neg + returnString;
        }

        if (!opts.decimalSeparatorAlwaysShown && returnString.lastIndexOf(dec) == returnString.length - 1) {
            returnString = returnString.substring(0, returnString.length - 1);
        }
        
        returnString = prefix + returnString + suffix;
        return returnString;

    };
    
    var parseNumber = function(text, options, dontmix){
        
        var opts = dontmix ? (options || defaults.parse) : $.extend({}, defaults.parse, options),   
            formatData = dontmix || formatCodes(opts.locale),
            dec = formatData.dec, group = formatData.group, neg = formatData.neg,
            valid = "1234567890.-"
        ;

        // now we need to convert it into a number
        while (text.indexOf(group) > -1){
            text = text.replace(group,'');
        }
        
        text = text.replace(dec,".").replace(neg,"-");
        
        var validText = "", hasPercent = false;
        
        if (text.charAt(text.length-1) == "%") { hasPercent = true }
        for (var i = 0, l = text.length; i < l; i++) {
            if (valid.indexOf(text.charAt(i)) > -1) {
                validText += text.charAt(i);
            }
        }
        
        var number = new Number(validText);
        if (hasPercent) {
            number = number / 100;
            number = number.toFixed(validText.length - 1);
        }

        return number;
        
    }
    
    // expose this in public:
    $.parseNumber = parseNumber;
    $.fn.parse = function(opts){
        var o = $.extend({}, defaults.parse, opts), codez = formatCodes(o.locale);
        return $.map(this, function(item){
            var me = $(item), val = me[me.is(":input") ? "val" : "text"]();
            return parseNumber(val, o, codez);
        });
    }
    $.fn.parse.defaults = defaults.parse;
    
    $.formatNumber = formatNumber;
    $.fn.format = function(opts){
        var o = $.extend({}, defaults.format, opts), codez = formatCodes(o.locale);
        return this.each(function(){
            var me = $(this);
            me[me.is(":input") ? "val" : "text" ](function(_, v){
                return formatNumber(v, o, codez);
            }); 
        });
    }
    $.fn.format.defaults = defaults.format;
    
})(jQuery);