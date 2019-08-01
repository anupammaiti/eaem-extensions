(function($, $document) {
    var TAGS_FIELD = "./jcr:content/metadata/cq:tags",
        SELECTED_TAGS_DIV = "eaem-column-view-selections",
        FOUNDATION_SELECTIONS_CHANGE = "foundation-selections-change",
        FOUNDATION_SELECTIONS_ITEM = "foundation-selections-item",
        FOUNDATION_COLLECTION = ".foundation-collection",
        FOUNDATION_COLLECTION_ITEM_VALUE = "foundation-picker-collection-item-value",
        $tagsContainer,
        extended = false;

    $document.on("foundation-contentloaded", handleTagsPicker);

    function handleTagsPicker(){
        if(extended){
            return;
        }

        var $tagsField = $("foundation-autocomplete[name='" + TAGS_FIELD + "']");

        if(_.isEmpty($tagsField)){
            return;
        }

        var pathField = $tagsField[0];

        extended = true;

        extendPicker(pathField);
    }

    function extendPicker(pathField){
        var origShowPicker = pathField._showPicker,
            origSetSelections = pathField._setSelections;

        pathField._showPicker = function(){
            origShowPicker.call(this);

            var $dialog = $(this._picker.el),
                $columnView = $dialog.find("coral-columnview");

            addSelectedSection($columnView);

            $dialog.on(FOUNDATION_SELECTIONS_CHANGE, FOUNDATION_COLLECTION, collectTags);
        };

        pathField._setSelections = function(selections, deferChangeEvent){
            var $tags = $tagsContainer.find("coral-tag"), selectedTags = [];

            _.each($tags, function(tag){
                selectedTags.push({
                    text: $(tag).find("coral-tag-label").html(),
                    value: tag.value
                });
            });

            origSetSelections.call(this, selectedTags, deferChangeEvent);
        }
    }

    function collectTags(){
        var $tag, tagValue, selectedTags = [];

        $("." + FOUNDATION_SELECTIONS_ITEM).each(function(index, tag){
            $tag = $(tag);

            tagValue = $tag.data(FOUNDATION_COLLECTION_ITEM_VALUE);

            if(_.isEmpty(tagValue)){
                return;
            }

            selectedTags.push({
                text: $tag.data("foundation-picker-collection-item-text"),
                value: tagValue
            });
        });

        buildSelectedContainer(selectedTags, $tagsContainer);
    }

    function buildSelectedContainer(selectedTags, $container) {
        if(_.isEmpty(selectedTags)){
            return;
        }

        var $tagList = $container.find("coral-taglist");

        if(_.isEmpty($tagList)){
            $container.find("#" + SELECTED_TAGS_DIV).remove();

            var tagListHtml = '<coral-taglist class="coral3-TagList"></coral-taglist>';

            $tagList = getSelectedTagsContainerDiv(tagListHtml).appendTo($container);
        }

        _.each(selectedTags, function (tag) {
            $tagList.append(getTagHtml(tag.text, tag.value));
        });

        handleRemoveSelectedTag($container);
    }

    function handleRemoveSelectedTag($container){
        $container.find("coral-taglist").on("change", function(){
            if(!_.isEmpty(this.values)){
                return;
            }

            addNoSelTagsDiv();
        })
    }

    function getTagHtml(title, value){
        return '<coral-tag class="coral3-Tag" value="' + value + '">' +
                    '<coral-tag-label>' + title + '</coral-tag-label>' +
                '</coral-tag>';
    }

    function addSelectedSection($columnView){
        $columnView.css("height", "70%");

        $tagsContainer = $("<div/>").appendTo($columnView.parent());

        addHeader($tagsContainer);

        addNoSelTagsDiv($tagsContainer);
    }

    function addHeader($container) {
        var html =  "<div style='text-align:center; padding:1px; background-color: rgba(0,0,0,0.05)'>" +
                        "<h3>Selected Tags</h3>" +
                    "</div>";

        return $(html).appendTo($container);
    }

    function getSelectedTagsContainerDiv(tagListHtml){
        return $("<div style='margin: 15px' id='" + SELECTED_TAGS_DIV + "'>" + tagListHtml + "</div>");
    }

    function addNoSelTagsDiv($container) {
        $container.find("#" + SELECTED_TAGS_DIV).remove();

        var html =  "<div style='margin: 15px' id='" + SELECTED_TAGS_DIV + "'>" +
                        "<div style='text-align: center'>No tags have been selected. Select a tag by clicking on tag thumnbnail</div>" +
                    "</div>";

        return $(html).appendTo($container);
    }
})(jQuery, jQuery(document));