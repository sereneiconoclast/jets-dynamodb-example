class CreatePostsMigration
  def up
    migration = Aws::Record::TableMigration.new(Post)
    migration.create!(
      # provisioned_throughput: {
      #   read_capacity_units: 5,
      #   write_capacity_units: 2
      # }
      billing_mode: 'PAY_PER_REQUEST'
    )
    migration.wait_until_available
  end
end
