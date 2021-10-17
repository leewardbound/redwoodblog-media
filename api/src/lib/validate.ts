export type ValidatorRulesModule = {
  [key: string]: (value: any, existing?: any) => any
}

async function validateFields<InputType>(
  rulesModule: ValidatorRulesModule,
  data: InputType
): Promise<InputType> {
  for (const field of Object.keys(data)) {
    if (Object.keys(rulesModule).includes(field)) {
      data[field] = await Promise.resolve(rulesModule[field](data[field]))
    }
  }
  return data
}

export async function validateCreate<InputType>(
  rulesModule: ValidatorRulesModule,
  data: InputType
): Promise<InputType> {
  data = await validateFields<InputType>(rulesModule, data)

  /* First we run the root validator */
  if (Object.keys(rulesModule).includes('root')) {
    data = await Promise.resolve(rulesModule.root(data))
  }

  /* Finally we run the creation validator */
  if (Object.keys(rulesModule).includes('create')) {
    data = await Promise.resolve(rulesModule.create(data))
  }
  return data
}
export async function validateUpdate<InputType, ExistingType>(
  rulesModule: ValidatorRulesModule,
  data: InputType,
  existing: ExistingType
): Promise<InputType> {
  data = await validateFields<InputType>(rulesModule, data)

  /* First we run the root validator */
  if (Object.keys(rulesModule).includes('root')) {
    data = await Promise.resolve(rulesModule.root(data, existing))
  }

  /* Finally we run the update validator */
  if (Object.keys(rulesModule).includes('update')) {
    data = await Promise.resolve(rulesModule.update(data, existing))
  }
  return data
}
