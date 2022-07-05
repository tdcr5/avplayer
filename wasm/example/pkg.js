

mergeInto(LibraryManager.library, {

    sub:function (a, b) {

        return a - b;
    },

    console_log: function (result) {

        print_self(result)
    }

})