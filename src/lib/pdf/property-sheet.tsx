import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { PROPERTY_KIND_LABELS } from "@/lib/constants";
import { formatArea, formatBRL } from "@/lib/format";

/**
 * Dados da ficha em PDF — de propósito só o que pode circular com um
 * cliente: NUNCA proprietário, comissão, documentos, ou endereço exato
 * (rua/número/coordenada). Ficha é pra vender o imóvel, não pra revelar
 * informação interna da operação.
 */
export type PropertySheetData = {
  code: string;
  title: string;
  kind: keyof typeof PROPERTY_KIND_LABELS;
  district: string | null;
  city: string | null;
  state: string | null;
  salePrice: number;
  condoFee: number | null;
  iptuYearly: number | null;
  usableArea: number | null;
  totalArea: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  description: string | null;
  features: string[];
  condoFeatures: string[];
  highlights: string[];
  coverPhotoUrl: string | null;
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  cover: { width: "100%", height: 260, objectFit: "cover", marginBottom: 16 },
  code: { fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 20, marginTop: 4, marginBottom: 6 },
  price: { fontSize: 16, marginBottom: 12, fontWeight: 700 },
  location: { fontSize: 11, color: "#444", marginBottom: 16 },
  factsRow: { flexDirection: "row", gap: 24, marginBottom: 16 },
  factLabel: { fontSize: 8, color: "#666", textTransform: "uppercase" },
  factValue: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 13, marginTop: 16, marginBottom: 6, fontWeight: 700 },
  paragraph: { fontSize: 10, lineHeight: 1.5, color: "#333" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    fontSize: 9,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function Tags({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.tagsWrap}>
        {items.map((item) => (
          <Text key={item} style={styles.tag}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function PropertySheetDocument({ property }: { property: PropertySheetData }) {
  const location = [property.district, property.city, property.state]
    .filter(Boolean)
    .join(", ");
  const area = property.usableArea ?? property.totalArea;

  return (
    <Document title={`Ficha — ${property.title}`}>
      <Page size="A4" style={styles.page}>
        {property.coverPhotoUrl && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={property.coverPhotoUrl} style={styles.cover} />
        )}

        <Text style={styles.code}>
          {property.code} · {PROPERTY_KIND_LABELS[property.kind]}
        </Text>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.price}>{formatBRL(property.salePrice)}</Text>
        {location && <Text style={styles.location}>{location}</Text>}

        <View style={styles.factsRow}>
          <Fact label="Área" value={area ? formatArea(area) : null} />
          <Fact label="Quartos" value={String(property.bedrooms)} />
          {property.suites > 0 && <Fact label="Suítes" value={String(property.suites)} />}
          <Fact label="Banheiros" value={String(property.bathrooms)} />
          <Fact label="Vagas" value={String(property.parkingSpots)} />
        </View>

        <View style={styles.factsRow}>
          <Fact
            label="Condomínio"
            value={
              property.condoFee && property.condoFee > 0
                ? `${formatBRL(property.condoFee)}/mês`
                : null
            }
          />
          <Fact
            label="IPTU"
            value={
              property.iptuYearly && property.iptuYearly > 0
                ? `${formatBRL(property.iptuYearly)}/ano`
                : null
            }
          />
        </View>

        {property.description && (
          <View>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.paragraph}>{property.description}</Text>
          </View>
        )}

        <Tags title="Características" items={property.features} />
        <Tags title="Condomínio" items={property.condoFeatures} />
        <Tags title="Diferenciais" items={property.highlights} />

        <Text style={styles.footer} fixed>
          Avança Imóveis — ficha gerada automaticamente, sujeita a alterações. O
          endereço completo é informado após contato com a equipe.
        </Text>
      </Page>
    </Document>
  );
}
