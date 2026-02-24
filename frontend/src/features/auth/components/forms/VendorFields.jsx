import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const VendorFields = ({ onDataChange, organizations, selectedOrgId }) => (
  <>
    <Select
      label="Organization"
      name="organizationId"
      value={selectedOrgId}
      onChange={onDataChange}
      required
    >
      <option value="">Select organization to partner with</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </Select>

    <Input
      label="Shop Name"
      name="shopName"
      placeholder="Healthy Bites"
      onChange={onDataChange}
      required
    />

    <Input
      label="GST Number"
      name="gstNumber"
      placeholder="22AAAAA0000A1Z5"
      onChange={onDataChange}
      required
    />
  </>
);

export default VendorFields;