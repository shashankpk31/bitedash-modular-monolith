import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const EmployeeFields = ({ onDataChange, organizations, selectedOrgId, suggestedOrg }) => (
  <>
    <Select
      label="Organization"
      name="organizationId"
      value={selectedOrgId}
      onChange={onDataChange}
      required
    >
      <option value="">Select your organization</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
          {suggestedOrg?.id === org.id ? " ✓ Detected from email" : ""}
        </option>
      ))}
    </Select>

    {suggestedOrg && (
      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        <span className="font-semibold">✓ Organization detected:</span> {suggestedOrg.name}
      </div>
    )}

    <Input
      label="Employee ID"
      name="employeeId"
      placeholder="EMP12345"
      onChange={onDataChange}
      required
    />
  </>
);

export default EmployeeFields;