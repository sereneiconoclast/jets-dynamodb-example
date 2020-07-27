class ApplicationItem
  include Aws::Record

  # ActiveRecord's #all equates to Dynomite's #scan
# class << self
#   alias_method :all, :scan
# end

  # To allow UrlHelper#url_for to work
# def to_model; self end
end
