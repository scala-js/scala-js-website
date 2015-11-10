module Tags
    class ColumnsBlock < Liquid::Block
        def render(context)
            '<div class="row">' + super + '</div>'
        end
    end

    class ColumnBlock < Liquid::Block
        SYNTAX = /^([0-9]+)\s+(.*)$/
        def initialize(tag_name, width, tokens)
            super
            @header = ''
            if width.strip =~ SYNTAX
                @width = $1
                @header = $2
            end
        end

        def render(context)
            return "" if @width.empty?

            site      = context.registers[:site]
            converter = site.getConverterImpl(Jekyll::Converters::Markdown)

            content = super.strip
            content = converter.convert(content)
            if @header != ''
                content = '<h6 class="code-block-header">' + @header + '</h6>' + content
            end
            '<div class="col-md-' + @width +'">' + content + '</div>'
        end
    end
end

Liquid::Template.register_tag('columns', Tags::ColumnsBlock)
Liquid::Template.register_tag('column',  Tags::ColumnBlock)
