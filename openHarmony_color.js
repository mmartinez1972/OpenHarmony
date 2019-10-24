//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, ...
//
//
//   This library is an open source implementation of a Document Object Model
//   for Toonboom Harmony. It also implements patterns similar to JQuery
//   for traversing this DOM.
//
//   Its intended purpose is to simplify and streamline toonboom scripting to
//   empower users and be easy on newcomers, with default parameters values,
//   and by hiding the heavy lifting required by the official API.
//
//   This library is provided as is and is a work in progress. As such, not every
//   function has been implemented or is garanteed to work. Feel free to contribute
//   improvements to its official github. If you do make sure you follow the provided
//   template and naming conventions and document your new methods properly.
//
//   This library doesn't overwrite any of the objects and classes of the official
//   Toonboom API which must remains available.
//
//   This library is made available under the MIT license.
//   https://opensource.org/licenses/mit
//
//   The repository for this library is available at the address:
//   https://github.com/cfourney/OpenHarmony/
//
//
//   For any requests feel free to contact m.chaptel@gmail.com
//
//
//
//
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           oColor class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// oPalette constructor
/**
 * oPalette Class
 * @class
 * @property   colorObject  {BaseColor}                         The Harmony color object.
 * @property   name         {string}                            The name of the color.
 * @property   id           {string}                            The id of the color.
 * @property   index        {string}                            The index of the color.
 * @property   type         {string}                            The type of the color.
 * @property   selected     {bool}                              Whether the color is selected.
 * @property   value        {...}                               The color value in a format contextual to the color type.
 *
 *
 * @function   {oColor}     moveToPalette( oPaletteObject, index )                            Moves the color to another Palette Object
 * @function   {void}       remove(  )                                                        Removes the color from the palette.
 *
 * @function   {void}       rgbaToHex(rgbaObject)                                             Static helper function to convert from {r:int, g:int, b:int, a:int} to a hex string in format #FFFFFFFF  
 * @function   {void}       hexToRgba(hexString)                                              Static helper function to convert from hex string in format #FFFFFFFF to {r:int, g:int, b:int, a:int}
*/
function oColor( oPaletteObject, index){
  // We don't use id in the constructor as multiple colors with the same id can exist in the same palette.
  this._type = "color";
  this.$     = oPaletteObject.$;

  this.palette = oPaletteObject;
  this._index = index;
}
 
 
// oColor Object Properties

/**
 * .colorObject
 * @return: {BaseColor}   The Harmony color object.
 */
Object.defineProperty(oColor.prototype, 'colorObject', {
    get : function(){
        return this.palette.paletteObject.getColorByIndex(this._index);
    }, 
    
    set : function(){
      throw "Not yet implemented";
    }
});


/**
 * .name
 * @return: {string}   The name of the color.
 */
Object.defineProperty(oColor.prototype, 'name', {
    get : function(){
        var _color = this.colorObject;
        return _color.name;
    },
 
    set : function(newName){
        var _color = this.colorObject;
        _color.setName(newName);
    }
});



/**
 * .id
 * @return: {string}   The id of the color.
 */
Object.defineProperty(oColor.prototype, 'id', {
    get : function(){
        var _color = this.colorObject;
        return _color.id
    },
 
    set : function(newId){
        // TODO: figure out a way to change id? Create a new color with specific id in the palette?
        throw "Not yet implemented";
    }
});


/**
 * .index
 * @return: {string}   The index of the color.
 */
Object.defineProperty(oColor.prototype, 'index', {
    get : function(){
        return this._index;
    },
 
    set : function(newIndex){
        var _color = this.palette.paletteObject.moveColor(this._index, newIndex);
        this._index = newIndex;
    }
});


/**
 * .type
 * @return: {string}   The type of the color.
 */
Object.defineProperty(oColor.prototype, 'type', {
    set : function(){
      throw "Not yet implemented.";
    },
    
    get : function(){
        var _color = this.colorObject;
        if (_color.isTexture()) return "texture";

        switch (_color.colorType) { 
            case PaletteObjectManager.Constants.ColorType.SOLID_COLOR: 
                return "solid";
            case PaletteObjectManager.Constants.ColorType.LINEAR_GRADIENT :
                return "gradient";
            case PaletteObjectManager.Constants.ColorType.RADIAL_GRADIENT:
                return "radial gradient";
            default:
        }
    }
});


/**
 * .selected
 * @return: {bool}   Whether the color is selected.
 */
Object.defineProperty(oColor.prototype, 'selected', {
    get : function(){
        var _currentId = PaletteManager.getCurrentColorId()
        var _colors = this.palette.colors;
        var _ids = _colors.map(function(x){return x.id})
        return this._index == _ids.indexOf(_currentId);
    },
 
    set : function(isSelected){
        // TODO: find a way to work with index as more than one color can have the same id, also, can there be no selected color when removing selection?
        if (isSelected){
            var _id = this.id;
            PaletteManager.setCurrentColorById(_id);
        }
    }
})


/**
 * .value
 * @return: {...}   Takes a string or array of strings for gradients and filename for textures. Instead of passing rgba objects, it accepts "#rrggbbaa" hex strings for convenience.
 *                   To set gradients, provide an array of {string color, double position} objects that define a gradient scale.
 */
Object.defineProperty(oColor.prototype, 'value', {
    get : function(){
        var _color = this.colorObject;
        switch(this.type){
            case "solid":
                return this.rgbaToHex(_color.colorData)
            case "texture":
                // TODO: no way to return the texture file name?
            case "gradient":
            case "radial gradient":
                var _gradientArray = _color.colorData;
                var _value = [];
                for (var i = 0; i<_gradientArray.length; i++){
                    var _tack = {}
                    _tack.color = this.rgbaToHex(_gradientArray[i])
                    _tack.position = _gradientArray[i].t
                    _value.push(_tack)
                }
                return _value;
            default:
        }
    },
 
    set : function(newValue){
        var _color = this.colorObject;
        switch(this.type){
            case "solid":
                _color.setColorData(this.hexToRgba(newValue));
                break;
            case "texture":
                // TODO: need to copy the file into the folder first?
                _color.setTextureFile(newValue);
                break;
            case "gradient":
            case "radial gradient":
                var _gradientArray = newValue;
                var _value = [];
                for (var i = 0; i<_gradientArray.length; i++){
                    var _tack = this.hexToRgba(_gradientArray[i].color)
                    _tack.t = _gradientArray[i]. position
                    _value.push()
                }
                _color.setColorData(_value);
                break;
            default:
        };
    }
})


// Methods

/**
 * moveToPalette
 *
 * Summary: Moves the palette to another Palette Object (CFNote: perhaps have it push to paletteObject, instead of being done at the color level)
 * @param   {oPaletteObject}     oPaletteObject              The paletteObject to move this color into.
 * @param   {int}                index                       Need clarification from mchap
 *  
 * @return: {oColor}           The new resulting oColor object.
 */
oColor.prototype.moveToPalette = function ( oPaletteObject, index ){
    var _color = this.colorObject;
    
    oPaletteObject.paletteObject.cloneColor(_color)
    this.palette.paletteObject.removeColor(_color.id)

    var _colors = oPaletteObject.colors
    var _duplicate = _colors.pop()
    
    if (typeof index !== 'undefined') _duplicate.index = index;

    return _duplicate;
}


/**
 * remove
 *
 * Summary: Removes the color from the palette it belongs to.
 * @return: { void }      No return value.
 */
oColor.prototype.remove = function (){
    // TODO: find a way to work with index as more than one color can have the same id
    this.palette.paletteObject.removeColor(this.id);
}


/**
 * rgbaToHex
 *
 * Summary: Static helper function to convert from {r:int, g:int, b:int, a:int} to a hex string in format #FFFFFFFF  
 *          Consider moving this to a helper function.
 * @param   { obj }       rgbaObject                       RGB object 
 *
 * @return: { string }    Hex color string in format #FFFFFFFF.
 */
oColor.prototype.rgbaToHex = function (rgbaObject){
    var _hex = "#";
    _hex += rvbObject.r.toString(16)
    _hex += rvbObject.g.toString(16)
    _hex += rvbObject.b.toString(16)
    _hex += rvbObject.a.toString(16)

    return _hex;
}


/**
 * hexToRgba
 *
 * Summary: Static helper function to convert from hex string in format #FFFFFFFF to {r:int, g:int, b:int, a:int}
 *          Consider moving this to a helper function.
 * @param   { string }    hexString                       RGB object 
 *
 * @return: { obj }    The hex object returned { r:int, g:int, b:int, a:int }
 */
oColor.prototype.hexToRgba = function (hexString){
    var _rgba = {};
    //Needs a better fail state.
    
    _rgba.r = parseInt(hexString.slice(1,3), 16)
    _rgba.g = parseInt(hexString.slice(3,5), 16)
    _rgba.b = parseInt(hexString.slice(5,7), 16)
    _rgba.a = parseInt(hexString.slice(7,9), 16)

    return _rgba;
}