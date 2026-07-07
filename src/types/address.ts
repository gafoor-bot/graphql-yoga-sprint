export type Address = {
  street: string;
  city: string;
  state: string;
  zipcode: string;
};

export type AddressRecord = {
  username: string;
  address: Address;
};
