module Tags
  class ScalaDoc < Liquid::Tag
    def initialize(tag_name, params, tokens)
      args = params.split(' ')
      if args.length == 1
        @ref = args.last.gsub(/^scala./, '')
        @content = args[0].split('.').last
      else
        @ref = args.last.gsub(/^scala./, '')
        @content = args[0...-1].join(' ')
      end
    end

    def render(context)
      '<a target="scaladoc" href="http://www.scala-lang.org/api/current/#scala.' + @ref + '"><code>' + Liquid::Template.parse(@content).render(context) + '</code></a>'
    end
  end

  class ScalaJSDoc < Liquid::Tag
    def initialize(tag_name, params, tokens)
      args = params.split(' ')
      if args.length == 1
        @ref = args.last.gsub(/^scala.scalajs./, '')
        @content = args[0].split('.').last
      else
        @ref = args.last.gsub(/^scala.scalajs./, '')
        @content = args[0...-1].join(' ')
      end
    end

    def render(context)
      '<a target="scaladoc" href="http://www.scala-js.org/api/scalajs-library/0.6.5/#scala.scalajs.' + @ref + '"><code>' + Liquid::Template.parse(@content).render(context) + '</code></a>'
    end
  end

  class DOMDoc < Liquid::Tag
    def initialize(tag_name, params, tokens)
      args = params.split(' ')
      if args.length == 1
        @ref = args.last.gsub(/^org.scalajs.dom./, '')
        @content = args[0].split('.').last
      else
        @ref = args.last.gsub(/^org.scalajs.dom./, '')
        @content = args[0...-1].join(' ')
      end
    end

    def render(context)
      '<a target="scaladoc" href="http://www.scala-js.org/api/scalajs-dom/0.8/#org.scalajs.dom.' + @ref + '"><code>' + Liquid::Template.parse(@content).render(context) + '</code></a>'
    end
  end

  class JSDoc < Liquid::Tag
    def initialize(tag_name, params, tokens)
      args = params.split(' ')
      if args.length == 1
        @ref = args.last.gsub('.', '/')
        @content = args[0].split('.').last
      else
        @ref = args.last.gsub('.', '/')
        @content = args[0...-1].join(' ')
      end
    end

    def render(context)
      '<a target="jsdoc" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/' + @ref + '"><code>' + Liquid::Template.parse(@content).render(context) + '</code></a>'
    end
  end
end

Liquid::Template.register_tag('scaladoc', Tags::ScalaDoc)
Liquid::Template.register_tag('scalajsdoc', Tags::ScalaJSDoc)
Liquid::Template.register_tag('domdoc', Tags::DOMDoc)
Liquid::Template.register_tag('jsdoc', Tags::JSDoc)
