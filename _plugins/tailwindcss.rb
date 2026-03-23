require 'tailwindcss/ruby'

Jekyll::Hooks.register :site, :post_write do |site|
  Jekyll.logger.info "Tailwind CSS:", "Compiling..."

  input  = File.join(site.source, '_css', 'input.css')
  output = File.join(site.dest, 'assets', 'css', 'tailwind.css')

  FileUtils.mkdir_p(File.dirname(output))

  args = [Tailwindcss::Ruby.executable, '-i', input, '-o', output]
  args << '--minify' if Jekyll.env == 'production'

  system(*args)
end
