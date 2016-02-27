module TextFilter
  def tokenize(input)
    input.downcase.gsub(/\s+/, ' ').gsub(/[^-\w.']+/, ' ').gsub(/ \S\S?(?= )/, ' ').gsub(/ \W+/, ' ').gsub(/\W+ /, ' ')
  end
end

require 'execjs'

module Tags
  class IndexBlock < Liquid::Block
    def initialize(tag_name, params, tokens)
      super
    end

    def render(context)
      content = super.strip
      data = ExecJS.eval('[' + content + ']')
      js = ExecJS.compile(open('_assets/js/lunr.js').read)
      js.call("buildIndex", data)
    end
  end
end

Liquid::Template.register_tag('lunrindex', Tags::IndexBlock)
Liquid::Template.register_filter(TextFilter)
