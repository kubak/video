Player = {
    currentProduct : 0,
    numberOfProducts : 0,
    lastTime : 0,
    timestamps : [],
    $el : "#player",
    init : function () {
        this.$el = $(this.$el);
        this.elements = { 
            productImage : $("#productImage"),
            productName : $("#product .productName"),
            productPrice : $("#product .productPrice")
        };
        var that = this;
        $.get('http://www.adjustyourset.tv/interview/cuepoints.xml', function (data) {
            that.cuepoints = $(data).find("cuepoint");
            that.parse();
        }, 'xml');
    },
    parse : function () {
        this.numberOfProducts = $(this.cuepoints).length;
        var that = this;
        // process timestamps
        $(this.cuepoints).each(function (index, value) {
            var cuepointTime = $(value).attr('timeStamp');
            // turn it into number of seconds
            var minutes = parseInt(cuepointTime.split(":")[0])*60;
            var seconds = parseInt(cuepointTime.split(":")[1]);
            that.timestamps.push(minutes + seconds);
        });
        // bind events
        this.$el.bind('timeupdate', $.proxy(this.timeupdate, this));
        this.$el.bind('seeked', $.proxy(this.seeked, this));
    },
    timeupdate : function () {
        if (this.currentProduct == this.numberOfProducts) {
            return;
        }
        var currentTime = this.$el.prop('currentTime');
        var cuepointTime = this.timestamps[this.currentProduct];
        if (this.lastTime < cuepointTime && currentTime > cuepointTime) {
            this.showProduct();
        }
        this.lastTime = currentTime;
    },
    seeked : function () { 
        var currentTime = this.$el.prop('currentTime');
        if (this.timestamps[0] > currentTime) {
            this.clearProduct();
            return;
        }
        for (var i=0; i < this.numberOfProducts; i++) {
            if (this.timestamps[i] < currentTime 
                && (i == this.numberOfProducts-1 || this.timestamps[i+1] > currentTime)) {
                this.currentProduct = i;
                this.showProduct();
                return;
            }
        }
        this.lastTime = currentTime;
    },
    showProduct : function () {
        var cuepoint = $(this.cuepoints).eq(this.currentProduct);
        var elems = this.elements;
        elems.productImage.show().attr('src', cuepoint.attr('thumbLink'));
        elems.productName.text(cuepoint.attr('desc'));
        elems.productPrice.text(cuepoint.attr('price'));
        this.currentProduct++;
    },
    clearProduct : function () {
        var elems = this.elements;
        elems.productImage.hide();
        elems.productName.text('');
        elems.productPrice.text('');
    }
};

$(function () {
    Player.init();
});
